function UniversalDApp (contracts, options) {
    this.options = options || {};
    this.$el = $('<div class="udapp" />');
    this.contracts = contracts;
    this.renderOutputModifier = options.renderOutputModifier || function(name, content) { return content; };

    if (!options.vm && web3.currentProvider) {

    } else if (options.vm) {
        this.vm = new EthVm();
        //@todo this does not calculate the gas costs correctly but gets the job done.
        this.identityCode = 'return { gasUsed: 1, return: opts.data, exception: 1 };';
        this.identityAddr = ethUtil.pad(new Buffer('04', 'hex'), 20)
        this.vm.loadCompiled(this.identityAddr, this.identityCode);
        this.secretKey = '3cd7232cd6f3fc66a57a6bedc1a8ed6c228fff0a327e169c2bcc5e869ed49511'
        this.publicKey = '0406cc661590d48ee972944b35ad13ff03c7876eae3fd191e8a2f77311b0a3c6613407b5005e63d7d8d76b89d5f900cde691497688bb281e07a5052ff61edebdc0'
        this.address = ethUtil.pubToAddress(new Buffer(this.publicKey, 'hex'));
        this.account = new Account();
        this.account.balance = 'f00000000000000001';
        this.nonce = 0;
        this.vm.stateManager.trie.put(this.address, this.account.serialize());   
    } else {
        var host = options.host || "localhost";
        var port = options.port || "8545";
        var rpc_url = options.getWeb3endpoint ? options.getWeb3endpoint() : ('http://' + host + ':' + port);
        web3.setProvider( new web3.providers.HttpProvider( rpc_url ) );
    }

}
UniversalDApp.prototype.render = function () {
    if (this.contracts.length == 0) {
        this.$el.append( this.getABIInputForm() );
    } else {

        for (var c in this.contracts) {
            var $contractEl = $('<div class="contract"/>');

            if (this.contracts[c].address) {
                this.getInstanceInterface(this.contracts[c], this.contracts[c].address, $contractEl );
            } else {
                var $title = $('<span class="title"/>').text( this.contracts[c].name );
                if (this.contracts[c].bytecode) {
                    $title.append($('<div class="size"/>').text((this.contracts[c].bytecode.length / 2) + ' bytes'))
                }
                $contractEl.append( $title ).append( this.getCreateInterface( $contractEl, this.contracts[c]) );
            }
            this.$el.append(this.renderOutputModifier(this.contracts[c].name, $contractEl));
        }
    }
    $legend = $('<div class="legend" />')
        .append( $('<div class="attach"/>').text('Attach') )
        .append( $('<div class="transact"/>').text('Transact') )
        .append( $('<div class="call"/>').text('Call') )

    this.$el.append( $('<div class="poweredBy" />')
        .html("<a href='http://github.com/d11e9/universal-dapp'>Universal ÐApp</a> powered by The Blockchain") )

    this.$el.append( $legend )
    return this.$el;
}

UniversalDApp.prototype.getContractByName = function(contractName) {
    for (var c in this.contracts)
        if (this.contracts[c].name == contractName)
            return this.contracts[c];
    return null;
};

UniversalDApp.prototype.getABIInputForm = function (cb){
    var self = this;
    var $el = $('<div class="udapp-setup" />');
    var $jsonInput = $('<textarea class="json" placeholder=\'[ { "name": name, "bytecode": bytecode, "interface": abi }, { ... } ]\'/>')
    var $createButton = $('<button class="udapp-create"/>').text('Create a Universal ÐApp')
    $createButton.click(function(ev){
        var contracts =  $.parseJSON( $jsonInput.val() );
        if (cb) {
            var err = null;
            var dapp = null;
            try {
                dapp = new UniversalDApp( contracts, self.options );
            } catch(e) {
                err = e;
            }
            cb( err, dapp )
        } else {
            self.contracts = contracts;
            self.$el.empty().append( self.render() )
        }
    })
    $el.append( $jsonInput ).append( $createButton )
    return $el;
}


UniversalDApp.prototype.getCreateInterface = function ($container, contract) {
    var self = this;
    var $createInterface = $('<div class="create"/>');
    if (this.options.removable) {
        var $close = $('<div class="udapp-close" />')
        $close.click( function(){ self.$el.remove(); } )
        $createInterface.append( $close );
    }
    var $newButton = this.getInstanceInterface( contract )
    var $atButton = $('<button class="atAddress"/>').text('At Address').click( function(){ self.clickContractAt( self, $container.find('.createContract'), contract ) } );
    $createInterface.append( $atButton ).append( $newButton );
    return $createInterface;
}

UniversalDApp.prototype.getInstanceInterface = function (contract, address, $target) {
    var self = this;
    var abi = JSON.parse(contract.interface).sort(function(a,b){
        if (a.name > b.name) return -1;
        else return 1;
    }).sort(function(a,b){
        if (a.constant == true) return -1;
        else return 1;
    });
    var web3contract = web3.eth.contract(abi);
    var funABI = this.getConstructorInterface(abi);
    var $createInterface = $('<div class="createContract"/>');

    var appendFunctions = function (address, $el){
        
        var $instance = $('<div class="instance"/>');
        if (self.options.removable_instances) {
            var $close = $('<div class="udapp-close" />')
            $close.click( function(){ $instance.remove(); } )
            $instance.append( $close );
        }
        var context = self.options.vm ? 'memory' : 'blockchain';
        var $title = $('<span class="title"/>').text( contract.name + " at " + (self.options.vm ? '0x' : '') + address.toString('hex')  + ' (' + context + ')');
        $title.click(function(){
            $instance.toggleClass('hide');
        });

        $events = $('<div class="events"/>');
        if (self.options.vm){
            self.vm.on('afterTx', function(response){
                // TODO: parse/use reponse.vm.logs
            });
        } else {
            var eventFilter = web3contract.at(address).allEvents();
            eventFilter.watch(function(err,response){
                $event = $('<div class="event" />')

                var $close = $('<div class="udapp-close" />')
                $close.click( function(){ $event.remove(); } )

                $event.append( $('<span class="name"/>').text(response.event) )
                    .append( $('<span class="args" />').text( JSON.stringify(response.args, null, 2) ) )
                    .append( $close );

                $events.append( $event );            
            })
        }
        $instance.append( $title );        

        $.each(abi, function(i, funABI) {
            if (funABI.type != 'function') return;
            // @todo getData cannot be used with overloaded functions
            $instance.append(self.getCallButton({
                abi: funABI,
                encode: function(args) {
                    var obj = web3contract.at('0x00')[funABI.name];
                    return obj.getData.apply(obj, args);
                },
                address: address
            }));
        });
        ($el || $createInterface ).append( $instance.append( $events ) );
    }

    if (!address || !$target) {
        $createInterface.append( this.getCallButton({
            abi: funABI,
            encode: function(args) {
                var obj = web3contract.new;
                return obj.getData.apply(obj, args);
            },
            contractName: contract.name,
            bytecode: contract.bytecode,
            appendFunctions: appendFunctions
        }));
    } else {
        appendFunctions( address, $target );
    }
    
    return $createInterface;
}

UniversalDApp.prototype.getConstructorInterface = function(abi) {
    var funABI = {'name':'','inputs':[],'type':'constructor','outputs':[]};
    for (var i = 0; i < abi.length; i++)
        if (abi[i].type == 'constructor') {
            funABI.inputs = abi[i].inputs || [];
            break;
        }
    return funABI;
}

UniversalDApp.prototype.getCallButton = function(args) {
    var self = this;
    // args.abi, args.encode, args.bytecode [constr only], args.address [fun only]
    // args.contractName [constr only], args.appendFunctions [constr only]
    var isConstructor = args.bytecode !== undefined;
    var lookupOnly = ( args.abi.constant && !isConstructor );

    var inputs = '';
    $.each(args.abi.inputs, function(i, inp) {
        if (inputs != '') inputs += ', ';
        inputs += inp.type + ' ' + inp.name;
    });
    var inputField = $('<input/>').attr('placeholder', inputs).attr('title', inputs);
    var $outputOverride = $('<div class="value" />');
    var outputSpan = $('<div class="output"/>');

    var getReturnOutput = function(result) {
        var returnName = lookupOnly ? 'Value' : 'Result';
        var returnCls = lookupOnly ? 'value' : 'returned';
        return $('<div class="' + returnCls + '">').html('<strong>' + returnName + ':</strong> ' + JSON.stringify( result, null, 2 ) )
    }

    var getGasUsedOutput = function (result) {
        var $gasUsed = $('<div class="gasUsed">')
        var caveat = lookupOnly ? '<em>(<span class="caveat" title="Cost only applies when called by a contract">caveat</span>)</em>' : '';
        if (result.gasUsed) {
            var gas = result.gasUsed.toString(10)
            $gasUsed.html('<strong>Cost:</strong> ' + gas + ' gas. ' + caveat )
        }
        return $gasUsed;
    }

    var getOutput = function() {
        var $result = $('<div class="result" />');
        var $close = $('<div class="udapp-close" />');
        $close.click( function(){ $result.remove(); } );
        $result.append( $close );
        return $result;
    };
    var clearOutput = function($result) {
        $(':not(.udapp-close)', $result).remove();
    };
    var replaceOutput = function($result, message) {
        clearOutput($result);
        $result.append(message);
    };

    var handleCallButtonClick = function(ev, $result) {
        if (!$result) {
            $result = getOutput(); 
            if (lookupOnly && !inputs.length)
                $outputOverride.empty().append( $result );
            else
                outputSpan.append( $result );
        }

        var funArgs = '';
        try {
            funArgs = $.parseJSON('[' + inputField.val() + ']');
        } catch (e) {
            replaceOutput($result, $('<span/>').text('Error encoding arguments: ' + e));
            return;
        }
        var data = '';
        if (!isConstructor || funArgs.length > 0)
            data = args.encode(funArgs);
        if (data.slice(0, 9) == 'undefined')
            data = data.slice(9);
        if (data.slice(0, 2) == '0x') data = data.slice(2);

        replaceOutput($result, $('<span>Waiting for transaction to be mined...</span>'));

        if (isConstructor) {
            if (args.bytecode.indexOf('_') >= 0) {
                 replaceOutput($result, $('<span>Deploying and linking required libraries...</span>'));
                 if (self.options.vm)
                     self.linkBytecode(args.contractName, function(err, bytecode) {
                         if (err)
                             replaceOutput($result, $('<span/>').text('Error deploying required libraries: ' + err));
                         else {
                             args.bytecode = bytecode;
                             handleCallButtonClick(ev, $result);
                         }
                     });
                 else
                     replaceOutput($result, $('<span>Contract needs to be linked to a library, this is only supported in the JavaScript VM for now.</span>'));
                 return;
             } else
                 data = args.bytecode + data;
        }

        self.runTx(data, args, function(err, result) {
            if (err) {
                replaceOutput($result, $('<span/>').text(err).addClass('error'));
            } else if (self.options.vm && result.vm.return === undefined) {
                replaceOutput($result, $('<span/>').text('Exception during execution.').addClass('error'));
            } else if (self.options.vm && isConstructor) {
                replaceOutput($result, getGasUsedOutput(result));
                args.appendFunctions(result.createdAddress);
            } else if (self.options.vm){
                //@todo implement once decoder is exposed by web3.js
                //var outputObj = fun.unpackOutput('0x' + result.vm.return.toString('hex'));
                var outputObj = '0x' + result.vm.return.toString('hex');
                clearOutput($result);
                $result.append(getReturnOutput(outputObj)).append(getGasUsedOutput(result.vm));
            } else if (args.abi.constant && !isConstructor) {
                replaceOutput($result, getReturnOutput(result));
            } else {
                
                function tryTillResponse (txhash, done) {
                    web3.eth.getTransactionReceipt(result, testResult );

                    function testResult (err, address) {
                        if (!err && !address) {
                            setTimeout( function(){ tryTillResponse(txhash, done) }, 500);
                        } else done( err, address );
                    }

                }
                tryTillResponse( result, function(err, result) {
                    if (err) replaceOutput($result, $('<span/>').text(err).addClass('error'));
                    else if (isConstructor) {
                        $result.html('');
                        args.appendFunctions(result.contractAddress);
                    } else {
                        clearOutput($result);
                        $result.append(getReturnOutput(result)).append(getGasUsedOutput(result));
                    }
                })
            
            }
        });
    }

    var button = $('<button />')
        .addClass( 'call' )
        .attr('title', args.abi.name)
        .text(args.bytecode ? 'Create' : args.abi.name)
        .click( handleCallButtonClick );

    if (lookupOnly && !inputs.length) {
        handleCallButtonClick();
    }

    var $contractProperty = $('<div class="contractProperty"/>');
    $contractProperty
        .toggleClass( 'constant', !isConstructor && args.abi.constant )
        .toggleClass( 'hasArgs', args.abi.inputs.length > 0)
        .toggleClass( 'constructor', isConstructor)
        .append(button)
        .append( (lookupOnly && !inputs.length) ? $outputOverride : inputField );
    return $contractProperty.append(outputSpan);
}

UniversalDApp.prototype.linkBytecode = function(contractName, cb) {
    var bytecode = this.getContractByName(contractName).bytecode;
    if (bytecode.indexOf('_') < 0)
        return cb(null, bytecode);
    var m = bytecode.match(/__([^_]{1,36})__/);
    if (!m)
        return cb("Invalid bytecode format.");
    var libraryName = m[1];
    if (!this.getContractByName(contractName))
        return cb("Library " + libraryName + " not found.");
    var self = this;
    this.deployLibrary(libraryName, function(err, address) {
        if (err) return cb(err);
        var libLabel = '__' + libraryName + Array(39 - libraryName.length).join('_');
        var hexAddress = address.toString('hex');
        if (hexAddress.slice(0, 2) == '0x') hexAddress = hexAddress.slice(2);
        hexAddress = Array(40 - hexAddress.length + 1).join('0') + hexAddress;
        while (bytecode.indexOf(libLabel) >= 0)
            bytecode = bytecode.replace(libLabel, hexAddress);
        self.getContractByName(contractName).bytecode = bytecode;
        self.linkBytecode(contractName, cb);
    });
};

UniversalDApp.prototype.deployLibrary = function(contractName, cb) {
    if (this.getContractByName(contractName).address)
        return cb(null, this.getContractByName(contractName).address);
    var self = this;
    var bytecode = this.getContractByName(contractName).bytecode;
    if (bytecode.indexOf('_') >= 0)
        this.linkBytecode(contractName, function(err, bytecode) {
            if (err) cb(err);
            else self.deployLibrary(contractName, cb);
        });
    else {
        this.runTx(bytecode, {abi: {constant: false}, bytecode: bytecode}, function(err, result) {
            if (err) return cb(err);
            self.getContractByName(contractName).address = result.createdAddress;
            cb(err, result.createdAddress);
        });
    }
};

UniversalDApp.prototype.clickNewContract = function ( self, $contract, contract ) {
    $contract.append( self.getInstanceInterface(contract) );
}

UniversalDApp.prototype.clickContractAt = function ( self, $output, contract ) {
    var address = prompt( "What Address is this contract at in the Blockchain? ie: '0xdeadbeaf...'" )   
    self.getInstanceInterface(contract, address, $output );
}

UniversalDApp.prototype.runTx = function( data, args, cb) {
    var self = this;
    var to = args.address;
    var constant = args.abi.constant;
    var isConstructor = args.bytecode !== undefined;

    var gas = self.options.getGas ? self.options.getGas : 1000000;
    var value = self.options.getValue ? self.options.getValue : 0;
    
    if (!this.vm) {
        if (constant && !isConstructor) {
            var func = web3.eth.contract( [args.abi] ).at( to );
            func[args.abi.name].call( cb );
        } else {
            var tx = {
                from: self.options.getAddress ? self.options.getAddress() : web3.eth.accounts[0],
                to: to,
                data: data,
                gas: gas,
                value: value
            };
            web3.eth.estimateGas( tx, function(err, resp){
                tx.gas = resp;
                if (!err) web3.eth.sendTransaction( tx, function(err, resp) {
                    cb( err, resp );
                });
                else cb( err, resp);
            });
        }
    } else {
        try {
            var tx = new Tx({
                nonce: new Buffer([this.nonce++]), //@todo count beyond 255
                gasPrice: '01',
                gasLimit: '3000000000', //plenty
                to: to,
                value: value,
                data: data
            });
            tx.sign(new Buffer(this.secretKey, 'hex'));
            this.vm.runTx({tx: tx}, cb);
        } catch (e) {
            cb( e, null );
        }
    }
}
