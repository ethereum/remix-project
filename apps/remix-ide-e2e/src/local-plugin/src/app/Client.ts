import { PluginClient } from '@remixproject/plugin'
import { customAction } from '@remixproject/plugin-api/lib/file-system/file-panel'
import { createClient } from '@remixproject/plugin-webview'
import { BehaviorSubject } from 'rxjs'
import axios from 'axios'

const simpleContract = `pragma solidity >=0.4.22 <0.7.0;
/**
* @title Storage
* @dev Store & retreive value in a variable
*/
contract StorageTestUpdateConfiguration {
  uint256 number;
  /**
   * @dev Store value in variable
   * @param num value to store
   */
  function store(uint256 num) public {
      number = num;
  }
  /**
   * @dev Return value 
   * @return value of 'number'
   */
  function retreive() public view returns (uint256){
      return number;
  }
}
          
          `

export class WorkSpacePlugin extends PluginClient {
  callBackEnabled: boolean = true;
  feedback = new BehaviorSubject<any>('');

  constructor () {
    super()
    createClient(this)

    this.methods = ['customAction']

    this.onload()
      .then(async (x) => {
        // console.log("client loaded", JSON.stringify(this));
        try {
          // await this.call("solidityUnitTesting", "testFromSource", "");
        } catch (e) {
          // console.log("not available");
        }
        /*
      let acc = await this.call("udapp","getSettings")
      console.log(acc)
      let ac2 = await this.call("udapp","getAccounts")
      console.log(ac2)
      const privateKey = "71975fbf7fe448e004ac7ae54cad0a383c3906055a75468714156a07385e96ce"
      const balance = "0x56BC75E2D63100000"
      let na = await this.call("udapp","createVMAccount",{ privateKey, balance })
      console.log(na)

      this.on('udapp', 'newTransaction', (tx: any) => {
        // Do something
        console.log("new transaction", tx)
      })

      this.on("solidity","compilationFinished",function(x){
        console.log("comp fin",x)
      })
      */
        await this.setCallBacks()

        this.on(
          'solidity',
          'compilationFinished',
          function (target, source, version, data) {
            console.log('compile finished', target, source, version, data)
          }
        )
      })
      .catch(async (e) => {
        console.log('ERROR CONNECTING', e)
      })
  }

  async setCallBacks () {
    const cmd: customAction = {
      id: this.name,
      name: 'customAction',
      type: ['file', 'folder'],
      extension: [],
      path: [],
      pattern: []
      // sticky: true
    }

    const cmd2: customAction = {
      id: this.name,
      name: 'myAction2',
      type: ['file', 'folder'],
      extension: [],
      path: [],
      pattern: []
    }

    this.call('filePanel', 'registerContextMenuItem', cmd)
    this.call('filePanel', 'registerContextMenuItem', cmd2)

    console.log('set listeners')
    const me = this
    this.on('fileManager', 'currentFileChanged', function (x) {
      me.setFeedback({
        event: 'currentFileChanged',
        result: x
      })
    })

    this.on('filePanel', 'customAction', function (x) {
      console.log('custom ACTION', x)
    })

    this.on('fileManager', 'fileRemoved', function (x) {
      me.setFeedback(`fileRemoved:${x}`)
    })

    this.on(
      'solidity',
      'compilationFinished',
      function (target, source, version, data) {
        console.log('compile finished', target, source, version, data)
      }
    )

    this.on('fileManager', 'fileAdded', function (x) {
      console.log('added file', x)
      me.log(x)
    })

    /*     this.on("fileExplorers", "createWorkspace", function (x) {
      console.log("ws create", x);
      me.log(x);
    });

    this.on("fileExplorers", "setWorkspace", function (x) {
      console.log("ws set", x);
      me.log(x);
    });

    this.on("fileExplorers", "deleteWorkspace", function (x) {
      console.log("wS DELETE", x);
      me.log(x);
    });

    this.on("fileExplorers", "renameWorkspace", function (x) {
      console.log("wS rn", x);
      me.log(x);
    }); */
  }

  setFeedback (ob: any) {
    this.feedback.next(ob)
    console.log(ob)
  }

  async customAction (o:customAction) {
    console.log('custom action called', o)
  }

  async log (message: string) {
    // console.log(message)
    this.call('terminal', 'log', { type: 'info', value: 'Name\r\nAniket' })
    this.call('terminal', 'log', { type: 'html', value: '<div>test</div><ul><li>test</li></ul>' })
  }

  async changetoinjected () {
    this.call('udapp', 'setEnvironmentMode', 'injected')
  }

  async test (p: string) {}

  async activate (id: string) {
    this.call('manager', 'activatePlugin', id)
  }

  async deactivate (id: string) {
    this.call('manager', 'deactivatePlugin', id)
  }

  async getresult () {
    const r = await this.call('solidity', 'getCompilationResult')
    console.log('RESULT', r)
  }

  async gitbranches () {
    // let r = await this.call("dGitProvider","branches")
    // console.log("branches", r)
  }

  async gitbranch (dir: string) {
    // let r = await this.call("dGitProvider","branch",dir)
  }

  async gitcurrentbranch () {
    try {
      const r = await this.call('dGitProvider', 'currentbranch')
      this.setFeedback(r)
    } catch (e) {
      this.setFeedback(e.message)
    }
  }

  async gitcheckout (dir: string) {
    // let r = await this.call("dGitProvider","checkout",dir)
  }

  async gitinit (dir: string) {
    // let s = await this.call("fileExplorers","getCurrentWorkspace")
    // let r = await this.call("dGitProvider","init")
  }

  async gitstatus (dir: string) {
    //  let r = await this.call("dGitProvider","status",'HEAD')
    // console.log("git status ", r)
  }

  async gitadd (dir: string) {
    // let r = await this.call("dGitProvider","add",dir)
    // console.log("git add ", r)
  }

  async gitremove (dir: string) {
    //  let r = await this.call("dGitProvider","rm",dir)
    //  console.log("git rm ", r)
  }

  async gitlog () {
    //  let r = await this.call("dGitProvider","log",'HEAD')
    // console.log("git log ", r)
  }

  async gitcommit () {
    //  let r = await this.call("dGitProvider","commit",{})
    //  console.log("git log ", r)
  }

  async gitlsfiles () {
    //  let r = await this.call("dGitProvider","lsfiles",'HEAD')
    // console.log("git log ", r)
  }

  async gitresolveref () {
    //  let r = await this.call("dGitProvider","resolveref",'HEAD')
    //  console.log("git resolve ", r)
  }

  async gitreadblob (file: string) {
    //  let c = await this.call("dGitProvider","log",'HEAD')
    //  console.log(c[c.length-1].oid)
    //  let r = await this.call("dGitProvider","readblob",{oid:c[c.length-1].oid, filepath:"README.txt"})
    //  console.log("git blob ", r)
  }

  async ipfspush () {
    console.log(await this.call('dGitProvider', 'push'))
  }

  async pinatapush () {
    try {
      const r = await this.call('dGitProvider' as any, 'pin', '124def6d9115e0c2c521', '130c1a8b18fd0c77f9ee8c1614146d277c3def661506dbf1c78618325cc53c8b')
      console.log(r)
    } catch (err) {
      console.log(err)
    }
  }

  async pinlist () {
    try {
      const r = await this.call('dGitProvider' as any, 'pinList', '124def6d9115e0c2c521', '130c1a8b18fd0c77f9ee8c1614146d277c3def661506dbf1c78618325cc53c8b')
      console.log(r)
    } catch (err) {
      console.log(err)
    }
  }

  async ipfspull (cid: string) {
    try {
      await this.call('dGitProvider', 'pull', cid)
    } catch (e) {}
  }

  async ipfsConfig () {
    /* try{
      let r = await this.call("dGitProvider", "setIpfsConfig", {
        host: 'localhost',
        port: 5002,
        protocol: 'http',
        ipfsurl: 'https://ipfsgw.komputing.org/ipfs/'
      });
      console.log(r)
      }catch(e){
        console.log(e)
      }  */
  }

  async readddir (dir: string) {
    try {
      const files = await this.call('fileManager', 'readdir', dir)
      this.setFeedback(files)
    } catch (e) {
      this.setFeedback(e.message)
    }
  }

  async write (dir: string) {
    try {
      this.call('fileManager', 'setFile', dir, 'simple readme')
    } catch (e) {
      this.setFeedback(e.message)
    }
  }

  async getcurrentfile () {
    try {
      const files = await this.call('fileManager', 'getCurrentFile')
      this.setFeedback(files)
    } catch (e) {
      this.setFeedback(e.message)
    }
  }

  async switchfile (dir: string) {
    try {
      await this.call('fileManager', 'switchFile', dir)
    } catch (e) {
      this.setFeedback(e.message)
    }
  }

  async zip () {
    const r = await this.call('dGitProvider', 'zip')
  }

  async fetch (dir: string) {
    try {
      var files = await fetch(dir)
      console.log(files)
      console.log(files.toString())
    } catch (e) {
      console.error(e)
    }
  }

  async axios (dir: string) {
    try {
      var files = await axios.get(dir)
      console.log(files)
      console.log(files.toString())
    } catch (e) {
      console.error(e)
    }
  }

  async getcompilerconfig () {
    // let config = await this.call("solidity","getCompilerConfig")
    // console.log(config)
  }

  async getWorkSpace () {
    try {
      const s = await this.call('filePanel' as any, 'getCurrentWorkspace')
      this.setFeedback(s)
    } catch (e) {
      this.setFeedback(e.message)
    }
  }

  async getWorkSpaces () {
    //  let s = await this.call("fileExplorers","getWorkspaces")
    //  console.log(s)
  }

  async createWorkSpace (name: string) {
    try {
      await this.call('filePanel', 'createWorkspace', name)
    } catch (e) {
      this.setFeedback(e.message)
    }
  }

  async importcontent (dir: string) {
    console.log('import content')
    var content = await this.call(
      'contentImport',
      'resolve',
      'ipfs://Qmd1gr9VeQaYNA8wVDq86RwdeMZkfF93JZhhWgfCVewYtc'
    )
    console.log('content', content)
  }

  async open (dir: string) {
    await this.call('fileManager', 'open', dir)
  }

  async highlight (f: string) {
    this.call(
      'editor',
      'highlight',
      {
        start: {
          line: 0,
          column: 1
        },
        end: {
          line: 1,
          column: 10
        }
      },
      f,
      '#ffffff'
    )
  }

  async addAnnotation (f: string) {
    this.call('editor', 'addAnnotation', {
      row: 1,
      column: 1,
      text: 'annotation',
      type: 'error'
    })
    this.call('editor', 'addAnnotation', {
      row: 10,
      column: 2,
      text: 'annotation',
      type: 'info'
    })
    this.call('editor', 'addAnnotation', {
      row: 12,
      column: 1,
      text: 'annotation',
      type: 'warning'
    })
  }

  async clearAnnotations (f: string) {
    this.call('editor', 'clearAnnotations')
  }

  async activatePlugin (f:string) {
    try {
      await this.call('manager', 'activatePlugin', f)
      this.setFeedback(await this.call('manager', 'isActive', f))
    } catch (e) {
      this.setFeedback(e.message)
    }
  }

  async deActivatePlugin (f:string) {
    try {
      await this.call('manager', 'deactivatePlugin', f)
      this.setFeedback(await this.call('manager', 'isActive', f))
    } catch (e) {
      this.setFeedback(e.message)
    }
  }

  async getSettings () {
    try {
      const settings = await this.call('udapp', 'getSettings')
      this.setFeedback(settings)
    } catch (e) {
      this.setFeedback(e.message)
    }
  }

  async setSettings () {
    const settings = await this.call('udapp', 'setEnvironmentMode', 'injected')
    await this.getSettings()
  }

  async debug (hash:string) {
    const settings = await this.call('remixdprovider' as any, 'debug', hash)
  }

  async getAccounts () {
    try {
      const settings = await this.call('udapp', 'getAccounts')
      this.setFeedback(settings)
    } catch (e) {
      this.setFeedback(e.message)
    }
  }

  async soltest () {
    const f = `pragma solidity >=0.4.0;

    contract SimpleStorage {
        uint storedData;
        
        // a public function named set that returns a uint goes here
        function set(uint _p1) public returns (uint) {
            storedData = _p1;
        }
        
       function get() public view returns (uint) {
            return storedData;
        }
    }
    `

    const t = `pragma solidity >=0.4.0;
    import "remix_tests.sol"; // this import is automatically injected by Remix.
    import "./modifyVariable.sol";
    
    contract test3 {
    
        SimpleStorage storageToTest;
        function beforeAll () public {
           storageToTest = new SimpleStorage();
        }
    
        function checkSetFunction () public {
            storageToTest.set(12345);
            Assert.equal(storageToTest.get(), uint(12345), "the contract should contain the function set");
        }
    }
    `
    // await this.call('fileManager', 'setFile', '/modifyVariable.sol', f)
    await this.call('fileManager', 'switchFile', 'tests/4_Ballot_test.sol')
    // await this.call('fileManager', 'setFile', '/modifyVariable_test.sol', t)
    const result = await this.call(
      'solidityUnitTesting',
      'testFromPath',
      'tests/4_Ballot_test.sol'
    )
    this.setFeedback(result)
  }

  async disableCallBacks () {
    this.callBackEnabled = false
  }

  async enableCallBacks () {
    this.callBackEnabled = true
  }
}
