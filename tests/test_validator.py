"""Host harness exercises the actual validator closure, with separate node answers.
This complements GenVM direct tests; it does not claim to simulate consensus voting.
"""
import ast
import hashlib
import json
from pathlib import Path
from types import SimpleNamespace
import pytest

ROOT=Path(__file__).parents[1]
class Return:
    def __init__(self,value):self.calldata=value

@pytest.fixture
def runtime():
    answers=[]
    documents={}
    def prompt(p, **kwargs):return answers.pop(0)
    def get(url):return SimpleNamespace(status=200,body=documents[url])
    def run(leader,validator):
        result=leader()
        if not validator(Return(result)):raise ValueError('VALIDATOR_DISAGREED')
        return result
    gl=SimpleNamespace(Contract=object,public=SimpleNamespace(write=lambda f:f,view=lambda f:f),message=SimpleNamespace(sender_address='0xcreator'),vm=SimpleNamespace(UserError=ValueError,Return=Return,run_nondet_unsafe=run),nondet=SimpleNamespace(exec_prompt=prompt,web=SimpleNamespace(get=get)))
    tree=ast.parse((ROOT/'contracts/protocol_lens.py').read_text())
    tree.body=[n for n in tree.body if not isinstance(n,ast.ImportFrom)]
    scope={'gl':gl,'TreeMap':dict,'u256':int};exec(compile(tree,'protocol_lens.py','exec'),scope)
    c=scope['ProtocolLens']();c.records={}
    reg=(ROOT/'examples/registration.txt').read_bytes();study=(ROOT/'examples/study.txt').read_bytes()
    base='https://raw.githubusercontent.com/a/b/'+'a'*40+'/'
    c.commit_study('Example',base+'registration.txt',hashlib.sha256(reg).hexdigest(),len(reg),base+'study.txt',hashlib.sha256(study).hexdigest(),len(study))
    documents[base+'registration.txt']=reg;documents[base+'study.txt']=study
    def report(finding):return json.dumps({'checks':[{'category':cat,'finding':finding if i==0 else 'MATCH','registration_quote':'Primary outcome:' if i==0 else 'Sample size:','study_quote':'Primary outcome:' if i==0 else 'Sample size:','explanation':'Evidence supports this research comparison.'} for i,cat in enumerate(scope['CATEGORIES'])]})
    return c,answers,documents,report

def test_independent_disagreement_rejects(runtime):
    c,a,d,r=runtime;a.extend([r('UNEXPLAINED'),r('MATCH')])
    with pytest.raises(ValueError,match='DISAGREED'):c.review('1')
    assert json.loads(c.get_review('1'))['history']==[]

def test_unsupported_explanation_rejected(runtime):
    c,a,d,r=runtime;a.extend([r('EXPLAINED'),r('EXPLAINED'),'false'])
    with pytest.raises(ValueError,match='DISAGREED'):c.review('1')

def test_independent_agreement_and_grounding(runtime):
    c,a,d,r=runtime;a.extend([r('UNEXPLAINED'),r('UNEXPLAINED'),'true']);c.review('1')
    assert json.loads(c.get_review('1'))['history'][0]['report']['outcome']=='DEVIATIONS'

def test_unavailable_source_is_independently_checked(runtime):
    c,a,d,r=runtime;d.clear();c.review('1')
    assert json.loads(c.get_review('1'))['history'][0]['report']['outcome']=='INCONCLUSIVE'
