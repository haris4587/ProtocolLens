import hashlib
import json
from pathlib import Path
import pytest
from gltest.direct import VMContext, deploy_contract, create_address

ROOT=Path(__file__).parents[1]
REG=(ROOT/'examples/registration.txt').read_bytes()
STUDY=(ROOT/'examples/study.txt').read_bytes()
BASE='https://raw.githubusercontent.com/haris4587/ProtocolLens/'+'a'*40+'/examples/'

def args():
    return ['Sleep study', BASE+'registration.txt', hashlib.sha256(REG).hexdigest(),len(REG),BASE+'study.txt',hashlib.sha256(STUDY).hexdigest(),len(STUDY)]

def report(finding='UNEXPLAINED'):
    return json.dumps({'checks':[{'category':c,'finding':finding if i==0 else 'MATCH','registration_quote':'Primary outcome: Change in self-reported sleep quality score from baseline to week 4.' if i==0 else ['','Planned analyses:','Population:','Sample size:'][i],'study_quote':'Primary outcome: Mean daily step count at week 4.' if i==0 else ['','Analyses reported:','Population:','Sample size:'][i],'explanation':'Primary outcome hierarchy changed without an explanation.' if i==0 else 'The reported specification matches the registered plan.'} for i,c in enumerate(['primary_outcome','planned_analyses','population','sample_size'])]})

@pytest.fixture
def deployed():
    vm=VMContext()
    with vm.activate():
        c=deploy_contract(ROOT/'contracts/protocol_lens.py',vm,sdk_version='v0.2.16')
        c.commit_study(*args())
        vm.mock_web(r'.*registration.txt',{'status':200,'body':REG})
        vm.mock_web(r'.*study.txt',{'status':200,'body':STUDY})
        vm.mock_llm('.*',report())
        yield vm,c

def mocks(vm, response, study=STUDY):
    vm.clear_mocks()
    vm.mock_web(r'.*registration.txt',{'status':200,'body':REG})
    vm.mock_web(r'.*study.txt',{'status':200,'body':study})
    vm.mock_llm('.*',response)

def get(c): return json.loads(c.get_review('1'))

def test_commitment_and_document_binding(deployed):
    vm,c=deployed
    r=get(c)
    assert r['registration']['sha256']==hashlib.sha256(REG).hexdigest()
    assert r['study']['bytes']==len(STUDY)
    assert r['history']==[] and len(r['commitment'])==64

def test_permission_and_no_state_change(deployed):
    vm,c=deployed
    vm.sender=create_address('0x'+'ab'*20)
    with vm.expect_revert('Only creator'): c.review('1')
    assert get(c)['history']==[]

@pytest.mark.parametrize('which,value',[(1,'http://127.0.0.1/x.txt'),(1,BASE.replace('a'*40,'main')+'a.txt'),(1,BASE+'../secret.txt'),(2,'x'*64),(3,50001),(6,29),(0,'a')])
def test_invalid_commitments(deployed,which,value):
    vm,c=deployed
    a=args();a[which]=value
    with vm.expect_revert(): c.commit_study(*a)
    assert json.loads(c.list_reviews(0,20))['total']==1

def test_duplicate_docs_rejected(deployed):
    vm,c=deployed
    a=args(); a[5]=a[2]
    with vm.expect_revert('distinct'): c.commit_study(*a)

@pytest.mark.parametrize('raw', ['not JSON','{}', '{"checks":[]}',report().replace('Primary outcome: Mean daily step count at week 4.','an invented excerpt'),report().replace('UNEXPLAINED','WRONG')])
def test_bad_model_output_is_inconclusive(deployed,raw):
    vm,c=deployed
    mocks(vm,raw)
    c.review('1')
    assert get(c)['history'][0]['report']['outcome']=='INCONCLUSIVE'

def test_hash_mismatch_never_passes(deployed):
    vm,c=deployed
    mocks(vm,report(),STUDY+b' tampered')
    c.review('1')
    assert get(c)['history'][0]['report']['reason']=='EVIDENCE_UNAVAILABLE_OR_MISMATCH'

@pytest.mark.parametrize('offset,limit',[(-1,10),(0,0),(0,21)])
def test_pagination_boundaries(deployed,offset,limit):
    vm,c=deployed
    with vm.expect_revert('pagination'): c.list_reviews(offset,limit)

def test_not_found(deployed):
    vm,c=deployed
    with vm.expect_revert('not found'): c.get_review('2')

# The direct runner executes the leader path. Independent validator disagreement and
# source-grounding checks are covered by the separate host-unit harness, and live
# consensus is recorded separately; a mocked result is never called live evidence.

@pytest.mark.parametrize('finding,outcome',[('MATCH','ALIGNED'),('EXPLAINED','EXPLAINED_CHANGES'),('UNEXPLAINED','DEVIATIONS'),('UNCLEAR','INCONCLUSIVE')])
def test_outcome_derivation(deployed,finding,outcome):
    vm,c=deployed
    mocks(vm,report(finding))
    c.review('1')
    assert get(c)['history'][0]['report']['outcome']==outcome

def test_history_is_linked_and_first_result_immutable(deployed):
    vm,c=deployed
    c.review('1'); first=get(c)['history'][0]
    mocks(vm,'invalid')
    c.review('1'); c.review('1')
    r=get(c)
    assert r['history'][0]==first
    for previous,entry in zip([r['commitment']]+[e['decision_hash'] for e in r['history']],r['history']):
        assert entry['previous_hash']==previous
        unsigned={k:v for k,v in entry.items() if k!='decision_hash'}
        raw=json.dumps(unsigned,sort_keys=True,ensure_ascii=False,separators=(',',':'))
        assert hashlib.sha256(raw.encode()).hexdigest()==entry['decision_hash']
    with vm.expect_revert('Three review attempts'):c.review('1')
    assert len(get(c)['history'])==3

def test_actual_sdk_validator_rejects_independent_disagreement(deployed):
    vm,c=deployed;c.review('1');mocks(vm,report('MATCH'))
    assert vm.run_validator() is False

def test_actual_sdk_validator_checks_prose_against_sources(deployed):
    vm,c=deployed;c.review('1');vm.clear_mocks()
    vm.mock_web(r'.*registration.txt',{'status':200,'body':REG})
    vm.mock_web(r'.*study.txt',{'status':200,'body':STUDY})
    vm.mock_llm('Check this proposed research audit', 'false')
    vm.mock_llm('You audit research reporting',report())
    assert vm.run_validator() is False

def test_actual_sdk_validator_accepts_grounded_agreement(deployed):
    vm,c=deployed;c.review('1');vm.clear_mocks()
    vm.mock_web(r'.*registration.txt',{'status':200,'body':REG})
    vm.mock_web(r'.*study.txt',{'status':200,'body':STUDY})
    vm.mock_llm('Check this proposed research audit','true')
    vm.mock_llm('You audit research reporting',report())
    assert vm.run_validator() is True
