// ==UserScript==
// @name                utilities
// @namespace                   tag:darkgray.org,2012:utilities
// @include                     http://*/*
// @description         Chrome user script addon that makes everything easier for me
// @version                             0.9.0
// ==/UserScript==
 
var modules = {
        init: function()
        {
                /* Module Initializers */
               
                // Hverse bot
                if(location.href.matches('http://hentaiverse.org*'))
                        modules.load('IWBTH');
        },
       
        _raw: {
                'IWBTH': function()
                {
                        moo.load(function()
                        {
                                Object.extend({
                                        compare: function(a, b, strict)
                                        {
                                                if(!a || !b || Object.getLength(a) != Object.getLength(b)) return false;
                                                return Object.every(a, function(value, key){ return typeof(value) == 'object' ?
                                                        Object.compare(value, b[key], strict) :
                                                        (strict ? b[key] === value : b[key] == value); }, this);
                                        }
                                });
                               
                                var jsc = jsconsole;
                                        jsc._write = jsc.write;
                                        jsc.write = function(data, styles, link)
                                        {
                                                jsc._write(data, styles, link);
                                                $$('._DG-countdown').each(function(item)
                                                {
                                                        item.store('_-countdown', (function()
                                                        {
                                                                var newValue = (item.get('text').toFloat()-0.1).round(1);
                                                               
                                                                if(newValue <= 0)
                                                                {
                                                                        clearInterval(item.retrieve('_-countdown'));
                                                                        item.removeClass('_DG-countdown');
                                                                        item.set('text', 0);
                                                                }
                                                               
                                                                else item.set('text', newValue.toString().contains('.') ? newValue : newValue.toString()+'.0');
                                                        }).periodical(100));
                                                });
                                        };
                               
                                var     mems = memory.session,
                                        meml = memory.local,
                                        ready = false,
                                        botURI = 'http://github.com/IWBTH/bot',
                                        wikiURI = 'http://ehwiki.org/wiki',
                                        STOREKEY = 'IWBTH',
                                       
                                        timeout_handler = 0,
                                        timeout_funct = null,
                                       
                                        _truedeath = function(targetXHR)
                                        {
                                                targetXHR.timeout_handler = 0;
                                                targetXHR.funct = null;
                                                targetXHR.cancel();
                                                clearTimeout(targetXHR.timeout_handler);
                                        },
                                       
                                        _timedout = function(type)
                                        {
                                                this.cancel();
                                               
                                                if(meml.get('dirs').retry_XHR)
                                                {
                                                        if(!this.retry)
                                                        {
                                                                this.wikifail(false);
                                                                this.Dlay = 10;
                                                        }
                                                       
                                                        else
                                                        {
                                                                this.wikifail(true);
                                                                this.Dlay = (this.Dlay*2).limit(10, 3600);
                                                        }
                                                       
                                                        var RT = Number(meml.get('dirs').retry_XHR),
                                                                inf = meml.get('dirs').retry_XHR === true;
                                                       
                                                        if(inf || RT > this.retry++)
                                                        {
                                                                debugSay(console.warn, 'The', type, 'operation timed out ('+(inf?'infinity':RT-this.retry)+' retries remaining). Retrying in '+this.Dlay+' seconds...');
                                                                jsc.write('Retrying in '+this.Dlay+' seconds...', '" class="uncarriable');
                                                                this.timeout_handler = (function(){ this.timeout_handler = 0; this.send(); }).delay(this.Dlay, this);
                                                        }
                                                       
                                                        else
                                                                debugSay(console.warn, 'The', type, 'operation timed out (retries exhausted). Please refresh the page.');
                                                }
                                               
                                                else
                                                {
                                                        debugSay(console.warn, 'The', type, 'operation timed out. Please refresh the page.');
                                                        this.wikifail(false);
                                                }
                                        },
                                       
                                        MCXHR = new Request.HTML({
                                               
                                                url: wikiURI+'/HentaiVerse_Bestiary',
                                                method: 'get',
                                                evalScripts: false,
                                                filter: 'div#bodyContent > div.mw-content-ltr > table.wikitable',
                                                timeout: 15000,
                                               
                                                wikifail: function(uncarriable)
                                                {
                                                        error('updateMonsterCache operation failed: Request timed out. Is '+
                                                                anchor(uri, 'the wiki')+
                                                                ' down for you?', uncarriable?'" class="uncarriable':'');
                                                },
                                               
                                                onFailure: function(xhr)
                                                {
                                                        debugSay(console.error, 'XHR Failure:', xhr);
                                                        this.wikifail(false);
                                                },
                                               
                                                onTimeout: function(){ _timedout.call(this, 'updateMonsterCache'); },
                                               
                                                onSuccess: function(d1, d2)
                                                {
                                                        var mdata = {},
                                                                prepare = function(str){ return (str.replace(/\s/gi, '').split(',').filter(function(i){ return i.length; }) || []).invoke('toLowerCase'); };
                                                       
                                                        d2.splice(0, 3).each(function(el, index)
                                                        {
                                                                el.getElements('tbody tr').splice(2).each(function(e)
                                                                {
                                                                        e = e.getChildren('td');
                                                                        var name = e[0].get('text').trim().toLowerCase();
                                                                       
                                                                        mdata[name] = {
                                                                                mid: e[1].get('text').trim(),
                                                                                dmgtype: e[2].get('text').trim().toLowerCase()
                                                                        };
                                                                                                                                                               
                                                                        if(index == 2)
                                                                        {
                                                                                mdata[name].resistances = prepare(e[7].get('text'));
                                                                                mdata[name].weaknesses = prepare(e[8].get('text'));
                                                                        }
                                                                       
                                                                        else
                                                                        {
                                                                                mdata[name].resistances = prepare(e[5].get('text'));
                                                                                mdata[name].weaknesses = prepare(e[7].get('text')).combine(prepare(e[6].get('text')));
                                                                        }
                                                                       
                                                                        mdata[name].resistances.reverse();
                                                                });
                                                        });
                                                       
                                                        debugSay('monsterCache updated successfully; return:', Object.clone(mdata));
                                                        mems.set('monsterCache', mdata);
                                                       
                                                        if(this.funct)
                                                        {
                                                                this.funct(mdata);
                                                                this.funct = null;
                                                        }
                                                }
                                        }),
                                       
                                        SCXHR = new Request.HTML({
                                               
                                                url: wikiURI+'/Spells',
                                                method: 'get',
                                                evalScripts: false,
                                                filter: 'div#bodyContent > div.mw-content-ltr > table.wikitable',
                                                timeout: 15000,
                                               
                                                wikifail: function(uncarriable)
                                                {
                                                        error('updateSpellCache operation failed: Request timed out. Is '+
                                                                anchor(uri, 'the wiki')+
                                                                ' down for you?', uncarriable?'" class="uncarriable':'');
                                                },
                                               
                                                onFailure: function(xhr)
                                                {
                                                        debugSay(console.error, 'XHR Failure:', xhr);
                                                        this.wikifail(false);
                                                },
                                               
                                                onTimeout: function(){ _timedout.call(this, 'updateSpellCache'); },
                                               
                                                onSuccess: function(d1, d2)
                                                {
                                                        var mdata = { pool: {}, elements: {}}, section = null;
                                                       
                                                        d2[1].getElements('tbody > tr').slice(1).each(function(item)
                                                        {
                                                                var data = item.getElement('th[colspan="6"]');
                                                               
                                                                if(data)
                                                                {
                                                                        section = data.getElement('span.mw-headline').get('id').trim().toLowerCase();
                                                                        mdata.elements[section] = { 'aoe': [], 'st': [] };
                                                                }
                                                               
                                                                else
                                                                {
                                                                        var name = item.getElements('th:not(th[rowspan="2"])').getLast().get('text').trim().toLowerCase(),
                                                                                type = item.getElements('td')[0].get('text').contains('(AoE)') ? 'aoe' : 'st';
                                                                       
                                                                        mdata.pool[name] = { element: section, type: type };
                                                                        mdata.elements[section][type].unshift(name);
                                                                }
                                                        });
                                                       
                                                        // Add the "elemental" element type (and stride its aoe and st elements correctly)
                                                        var stride = 0, target = null;
                                                        mdata.elements.elemental = { 'aoe': [], 'st': [] };
                                                       
                                                        var combinator = function(item, key)
                                                        {
                                                                var index = key*(stride+1)+stride;
                                                                if(index > target.length)
                                                                        target.push(item);
                                                                else
                                                                        target.splice(index, 0, item);
                                                        };
                                                       
                                                        Object.each(mdata.elements, function(value, key)
                                                        {
                                                                if(['fire', 'elec', 'cold', 'wind'].contains(key))
                                                                {
                                                                        if(!stride)
                                                                        {
                                                                                mdata.elements.elemental.aoe = Array.clone(value.aoe);
                                                                                mdata.elements.elemental.st = Array.clone(value.st);
                                                                        }
                                                                       
                                                                        else
                                                                        {
                                                                                target = mdata.elements.elemental.aoe;
                                                                                value.aoe.each(combinator);
                                                                                target = mdata.elements.elemental.st;
                                                                                value.st.each(combinator);
                                                                        }
                                                                       
                                                                        stride++;
                                                                }
                                                        });
                                                       
                                                        debugSay('spellCache updated successfully; return:', Object.clone(mdata));
                                                        mems.set('spellCache', mdata);
                                                       
                                                        if(this.funct)
                                                        {
                                                                this.funct(mdata);
                                                                this.funct = null;
                                                        }
                                                }
                                        }),
                                       
                                        defaultDirs = {
                                                bravery: 55,
                                                miss_threshold: 3,
                                               
                                                retry_XHR: true, // can be bool or int
                                                clean_mode: true,
                                               
                                                cast_curative: true,
                                                cast_deprecating: true,
                                                cast_immobilizations: true,
                                               
                                                initial_cast: ['spark of life'],
                                                sustain_cast: ['haste'],
                                                enemy_cast: [],
                                                limit_cast: [],
                                                default_cast_type: 'fire',
                                               
                                                attribute_priority: [['intelligence', 'wisdom'], ['endurance', 'agility'], 'strength', 'dexterity'],
                                                curative_priority: ['cure iii', 'regen ii', 'cure ii', 'cure', 'regen'],
                                                deprecating_priority: ['silence', 'nerf', 'weaken', 'blind', 'imperil', 'poison'],
                                                immobilize_priority: ['sleep', 'slow', 'magnet'],
                                                training_priority: [],
                                               
                                                can_flee: true,
                                               
                                                ignore_fear: false,
                                                ignore_defeat: true,
                                                ignore_inability: false,
                                                ignore_stamina: false,
                                               
                                                mimic_human: true,
                                                human_wait: [0.15, 1.15], // less than [0.10, 1.0] is dangerous!
                                                human_sleep: [[14, 18], [6, 10]], // [w, x], [y, z] - pause between y-z hours every between w-x hours - the bigger, the better (especially if the human wait is smaller than default)!
                                               
                                                auto_apply: true,
                                                auto_restore: true,
                                                auto_restock: true,
                                                auto_train: false,
                                                auto_resize: true,
                                               
                                                notification_method: 'ring',
                                                enable_debug: false,
                                                check_for_updates: true
                                        };
                               
                                var error       = function(e,t){ jsc.write('Error: '+e, 'color: red; font-weight: bold;'+(t?(' '+t):'')); },
                                        warn    = function(w,t){ jsc.write('Warning: '+w, 'color: orange; font-weight: bold;'+(t?(' '+t):'')); },
                                        info    = function(i,t){ jsc.write(i, 'color: DeepSkyBlue; font-weight: bold;'+(t?(' '+t):'')); },
                                        success = function(s,t){ jsc.write(s, 'color: green; font-weight: bold;'+(t?(' '+t):'')); },
                                        anchor  = function(href, text){ return '<a target="_blank" href="'+href+'" style="color: blue;">'+text+'</a>'; },
                                        invalid = function(){ error('invalid command syntax. Type "help" for more info.'); },
                                       
                                        setStatus = function(status)
                                        {
                                                mems.set('status', status);
                                                debugSay('Status set to:', status);
                                        },
                                       
                                        getMonsterCache = function(fn)
                                        {
                                                if(!mems.has('monsterCache'))
                                                {
                                                        MCXHR.retry = 0;
                                                        MCXHR.funct = fn;
                                                        MCXHR.send();
                                                }
                                               
                                                else if(fn)
                                                {
                                                        var data = mems.get('monsterCache');
                                                        debugSay('Using stored monsterCache; return:', Object.clone(data));
                                                        fn(data);
                                                }
                                        },
                                       
                                        getSpellCache = function(fn)
                                        {
                                                if(!mems.has('spellCache'))
                                                {
                                                        SCXHR.retry = 0;
                                                        SCXHR.funct = fn;
                                                        SCXHR.send();
                                                }
                                               
                                                else if(fn)
                                                {
                                                        var data = mems.get('spellCache');
                                                        debugSay('Using stored spellCache; return:', Object.clone(data));
                                                        fn(data);
                                                }
                                        },
                                       
                                        debugSay = function()
                                        {
                                                if(!console || !meml.get('dirs').enable_debug) return;
                                               
                                                if(typeOf(arguments[0]) == 'function')
                                                        arguments[0].apply(console, Array.from(arguments).slice(1));
                                                else
                                                        console.log.apply(console, Array.from(arguments));
                                        }
                                       
                                        getBattleElements = function()
                                        {
                                                var menu   = $$('div#leftpane div.btp div.btpa div.btpa2 img:nth-child(3)'),
                                                        skills = $$('div#leftpane div#togpane_skill table tbody tr td > div'),
                                                        magics = $$('div#leftpane div#togpane_magico table tbody tr td > div, div#leftpane div#togpane_magict table tbody tr td > div'),
                                                        items  = $$('div#leftpane div#togpane_item table tbody tr:not(:first-child) td div div.bti3 img.btii'),
                                                        pasFX  = $$('form#battleform div.btt div.btps img'),
                                                        HP         = $$('div.stuffbox.csp div.clb div.cwbdv div.cwbt div.cwbt1 div.fd12 div'),
                                                        MP         = HP[1],
                                                        HP         = HP[0],
                                                        creds  = $$('div.stuffbox.csp div.clb table.cit tbody tr td div.fd12 div'),
                                                        stam   = creds[10],
                                                        level  = creds[0],
                                                        creds  = creds[5];
                                               
                                                menu[1].getOffensive = function()
                                                {
                                                        var els = $$('div#leftpane div#togpane_magict');
                                                        if(els[0].getStyle('display') == 'none')
                                                                els = $$('div#leftpane div#togpane_magico');
                                                        return els[0].getElement('div.btpm1 div.btpm2 img');
                                                };
                                               
                                                menu[1].getTactical = function()
                                                {
                                                        var els = $$('div#leftpane div#togpane_magict');
                                                        if(els[0].getStyle('display') == 'none')
                                                                els = $$('div#leftpane div#togpane_magico');
                                                        return els[0].getElement('div.btpm1 div.btpm3 img');
                                                };
                                               
                                                var battleElements = {
                                                        options: {
                                                                attack: menu[0],
                                                                magic: menu[1],
                                                                spirit: menu[2],
                                                                skills: menu[3],
                                                                items: menu[4],
                                                                defend: menu[5],
                                                                focus: menu[6]
                                                        },
                                                       
                                                        items: items,
                                                        skills: {
                                                                flee: skills[0],
                                                                scan: skills[1],
                                                                concussiveStrike: skills[2]
                                                        },
                                                       
                                                        stats: {
                                                                hp: HP.get('text').split(' / '),
                                                                mp: MP.get('text').split(' / '),
                                                                credits: creds.get('text').toInt(),
                                                                stamina: stam.get('text').split('Stamina: ')[1].toInt(),
                                                                level: level.get('text').split('Level ')[1].toInt()
                                                        },
                                                       
                                                        playerActiveStatus: [],
                                                        magics: {},
                                                }
                                               
                                                magics.each(function(item)
                                                {
                                                        item.cost = item.get('onmouseover').split(',').getLast().clean().split(')')[0].toInt();
                                                        var key = item.getElement('div.fd10 div').get('text').toLowerCase();
                                                        battleElements.magics[key] = item;
                                                });
                                               
                                                pasFX.each(function(item)
                                                {
                                                        battleElements.playerActiveStatus.push(item.get('onmouseover').split("'")[1].toLowerCase());
                                                });
                                               
                                                debugSay('getBattleElements; return:', Object.clone(battleElements));
                                                return battleElements;
                                        },
                                       
                                        getEnemiesList = function()
                                        {
                                                var enemies = [];
                                                $$('div#monsterpane > div').each(function(item)
                                                {
                                                        if(item.getStyle('opacity') == 1)
                                                        {
                                                                var imob = 0, iteg = 0;
                                                               
                                                                item.getElements('div.btm6 img').some(function(item)
                                                                {
                                                                        if(meml.get('dirs').immobilize_priority.contains(item.get('src').split('/').getLast().split('.')[0]))
                                                                        {
                                                                                imob = item.get('onmouseover').split(',').getLast().clean().split(')')[0].toInt();
                                                                                return true;
                                                                        }
                                                                });
                                                               
                                                                item.getElements('div.btm6 img').some(function(item)
                                                                {
                                                                        if(meml.get('dirs').deprecating_priority.contains(item.get('src').split('/').getLast().split('.')[0]))
                                                                        {
                                                                                iteg = item.get('onmouseover').split(',').getLast().clean().split(')')[0].toInt();
                                                                                return true;
                                                                        }
                                                                });
                                                               
                                                                enemies.push({
                                                                        id: item.get('id'),
                                                                        name: item.getElement('div.btm3 > div > div').get('text'),
                                                                        level: item.getElement('div.btm2 > div:nth-child(2) > div div').get('text').toInt(),                   
                                                                        isBoss: item.getElement('div.btm2').style.background.length ? true : false,
                                                                        local: {                        // Bot-specific data (like immobilizations, etc.)
                                                                                immobilized: imob,
                                                                                deprecating: iteg
                                                                        }
                                                                });
                                                        }
                                                       
                                                        else enemies.push(null);
                                                });
                                               
                                                enemies.sort(function(a, b)
                                                {
                                                        if(!a) return -1;
                                                        if(!b) return 1;
                                                        if(a.isBoss && !b.isBoss) return -1;
                                                        if(b.isBoss && !a.isBoss) return 1;
                                                        return b.level - a.level;
                                                });
                                               
                                                debugSay('getEnemiesList; return:', Array.clone(enemies));
                                                return enemies;
                                        },
                                       
                                        /* Battle function. Returns true/false on victory/defeat, respectively */
                                        doBattle = function()
                                        {
                                                var initChecks = function()
                                                {
                                                        // Do any stamina etc. warnings here
                                                        debugSay(' -> initChecks');
                                                        return true;
                                                },
                                               
                                                iCantDoIt = function()
                                                {
                                                        debugSay(console.warn,'I can\'t do it...');
                                                       
                                                        if(meml.get('dirs').ignore_inability)
                                                                debugSay(console.error, '... but I will not flee (ignore_inability = true; dangerous!)');
                                                        else attemptFlee();
                                                },
                                               
                                                imScared = function()
                                                {
                                                        debugSay(console.warn, 'I\'m scared...');
                                                       
                                                        if(meml.get('dirs').ignore_fear)
                                                                debugSay(console.error, '... but I will not flee (ignore_fear = true; dangerous!)');
                                                        else attemptFlee();
                                                },
                                               
                                                mimicHuman = function(fn, minimum)
                                                {
                                                        if(!fn) throw 'Invalid use of mimicHuman';
                                                       
                                                        if(meml.get('dirs').mimic_human)
                                                        {
                                                                if(!minimum)
                                                                {
                                                                        var MODIFIER = 10,
                                                                        Dlay = ((Math.random()*(meml.get('dirs').human_wait[1]*6000))*(Number.random(1, MODIFIER*100)/100)).ceil().
                                                                                limit(meml.get('dirs').human_wait[0]*6000*MODIFIER, meml.get('dirs').human_wait[1]*6000*MODIFIER);
                                                                       
                                                                        info('Mimic human: pausing for <span class="_DG-countdown">'+(Dlay*.001).round(1)+'</span> seconds...', '" class="uncarriable');
                                                                        debugSay('Mimic human: pausing for', (Dlay*.001).round(1), 'seconds...');
                                                                }
                                                               
                                                                clearTimeout(timeout_handler);
                                                                timeout_funct = fn;
                                                               
                                                                timeout_handler = function()
                                                                {
                                                                        timeout_handler = 0;
                                                                        timeout_funct = null;
                                                                        fn();
                                                                }.delay(minimum ? 1000 : Dlay);
                                                        }
                                                       
                                                        else fn();
                                                },
                                               
                                                chooseSpell = function(range)
                                                {
                                                        var result = null,
                                                                domain = battleElements.magics,
                                                                intersect = range.filter(function(item)
                                                                {
                                                                        if(domain[item]) return true;
                                                                        return false;
                                                                });
                                                       
                                                        debugSay(' -> chooseSpell:', range, 'mapped onto', domain, '; intersect:', intersect);
                                                       
                                                        if(intersect.length)
                                                        {
                                                                debugSay('Set intersection noted!');
                                                                intersect.some(function(item, k)
                                                                {
                                                                        if(battleElements.stats.mp[0] < domain[item].cost)
                                                                        {
                                                                                if(k == intersect.length-1)
                                                                                {
                                                                                        attemptRestoreMP();
                                                                                        result = false;
                                                                                        return true;
                                                                                }
                                                                        }
                                                                       
                                                                        else
                                                                        {
                                                                                result = domain[item];
                                                                                return true;
                                                                        }
                                                                });
                                                        }
                                                       
                                                        if(result === false)
                                                                debugSay('Failed to choose spell: not enough MP');
                                                        else
                                                                debugSay('Spell chosen:', result?result:'(no suitable spell found)');
                                                       
                                                        return result;
                                                },
                                               
                                                attackEnemy = function()
                                                {
                                                        debugSay(' -> attackEnemy');
                                                       
                                                        debugSay('Attempting to fetch monsterCache if not stored...');
                                                        getMonsterCache(function(data)
                                                        {
                                                                debugSay('Attempting to fetch spellCache if not stored...');
                                                                getSpellCache(function(spellData)
                                                                {
                                                                        var monsterData = data[targetActual.name.toLowerCase()];
                                                                        if(monsterData)
                                                                        {
                                                                                debugSay('targetActual was found in monsterCache, calculating most effective maneuver...');
                                                                               
                                                                                // Determine if AOE or not
                                                                                var AOEauthorized = false, cleanedEnemiesList = enemiesList.clean();
                                                                                if(cleanedEnemiesList.length > 1)
                                                                                {
                                                                                        if(cleanedEnemiesList.some(function(item){ return item.local.immobilized; }))
                                                                                                debugSay('One or more non-target enemies are currently immobilized, sticking to single target spells');
                                                                               
                                                                                        else
                                                                                        {
                                                                                                debugSay('No non-target enemies are currently immobilized; use of AOE has been authorized');
                                                                                                AOEauthorized = true;
                                                                                        }
                                                                                }
                                                                               
                                                                                else debugSay('Enemy count too small; use of AOE is NOT authorized');
                                                                               
                                                                                // Gather an array of spells for the spell chooser
                                                                                var range = [];
                                                                                Array.combine([], monsterData.weaknesses).combine(monsterData.resistances).each(function(item)
                                                                                {
                                                                                        if(spellData.elements[item])
                                                                                        {
                                                                                                if(AOEauthorized)
                                                                                                        range.combine(spellData.elements[item].aoe).combine(spellData.elements[item].st);
                                                                                                else
                                                                                                        range.combine(spellData.elements[item].st);
                                                                                        }
                                                                                });
                                                                               
                                                                                debugSay('Offensive spell range determined:', range);
                                                                               
                                                                                // Execute spell on targetActual
                                                                                mimicHuman(function()
                                                                                {
                                                                                        clickElement(battleElements.options.magic);
                                                                                        mimicHuman(function()
                                                                                        {
                                                                                                clickElement(battleElements.options.magic.getOffensive());
                                                                                                mimicHuman(function()
                                                                                                {
                                                                                                        var spell = chooseSpell(range);
                                                                                                        if(spell) clickElement(spell);
                                                                                                        else if(spell === null)
                                                                                                        {
                                                                                                                debugSay('Hmm... maybe we should flee. How brave are we? again?');
                                                                                                                if(bravery >= 50)
                                                                                                                {
                                                                                                                        debugSay('Hell, we\'re pretty brave. Let\'s go with the Magic Missile!');
                                                                                                                        clickElement(battleElements.magics['magic missile']);
                                                                                                                }
                                                                                                               
                                                                                                                else return iCantDoIt();
                                                                                                        }
                                                                                                       
                                                                                                        mimicHuman(function(){ clickElement($(targetActual.id)); }, false);
                                                                                                }, true);
                                                                                        }, true);
                                                                                }, true);
                                                                        }
                                                                       
                                                                        else
                                                                        {
                                                                                debugSay('targetActual not found in monster cache; preparing to scan');
                                                                                mimicHuman(function()
                                                                                {
                                                                                        clickElement(battleElements.options.skills);
                                                                                        mimicHuman(function()
                                                                                        {
                                                                                                clickElement(battleElements.skills.scan);
                                                                                                mimicHuman(function()
                                                                                                {
                                                                                                        debugSay('Scanning...');
                                                                                                        mems.set('scanning', true);
                                                                                                        clickElement($(targetActual.id));
                                                                                                }, false);
                                                                                        }, true);
                                                                                }, true);
                                                                        }
                                                                });
                                                        });
                                                },
                                               
                                                attemptRestoreMP = function()
                                                {
                                                        debugSay(' -> attemptRestoreMP');
                                                       
                                                        if(battleElements.playerActiveStatus.contains('replenishment'))
                                                        {
                                                                debugSay(console.warn, 'Already replenishing MP!');
                                                                warn('your MP is not being replenished fast enough to efficiently utilize your various magics. You should consider investing in more powerful mana potions!');
                                                                return;
                                                        }
                                                       
                                                        if(battleElements.items.length)
                                                        {
                                                                mimicHuman(function()
                                                                {
                                                                        clickElement(battleElements.options.items);
                                                                        mimicHuman(function(){ clickElement(battleElements.items[0], function(){ clickElement(battleElements.items[0]); }); }, false);
                                                                }, true);
                                                        }
                                                       
                                                        else
                                                        {
                                                                debugSay(console.warn, 'Out of consumables!');
                                                                iCantDoIt();
                                                        }
                                                },
                                               
                                                attemptFlee = function()
                                                {
                                                        debugSay(' -> attemptFlee');
                                                       
                                                        mimicHuman(function()
                                                        {
                                                                warn('attempting to flee...');
                                                                clickElement(battleElements.options.skills);
                                                                mimicHuman(function(){ clickElement(battleElements.skills.flee, function(){ clickElement(battleElements.skills.flee); }); }, false);
                                                        }, true);
                                                },
                                               
                                                attemptCure = function()
                                                {
                                                        debugSay(' -> attemptCure ('+battleElements.stats.hp[0].toInt()+' <= '+HPstat+')');
                                                        mimicHuman(function()
                                                        {
                                                                clickElement(battleElements.options.magic);
                                                                mimicHuman(function()
                                                                {
                                                                        clickElement(battleElements.options.magic.getTactical());
                                                                        mimicHuman(function()
                                                                        {
                                                                                var spell = chooseSpell(meml.get('dirs').curative_priority);
                                                                                if(spell) clickElement(spell, function(){ clickElement(spell); });
                                                                                else if(spell === null) iCantDoIt();
                                                                        }, false);
                                                                }, true);
                                                        }, true);
                                                },
                                               
                                                attemptFocus = function()
                                                {
                                                        debugSay(' -> attemptFocus (!'+battleElements.playerActiveStatus.focus+' && '+atkFails+' > '+meml.get('dirs').miss_threshold+')');
                                                        mimicHuman(function(){ clickElement(battleElements.options.focus); }, false);
                                                },
                                               
                                                attemptDeprecating = function()
                                                {
                                                        debugSay(' -> attemptDeprecating (!'+targetActual.local.deprecating+
                                                                ' && ('+targetActual.isBoss+' || '+targetActual.level+' >= '+battleElements.stats.level+'-'+Math.round(5-5*bravery/99)+'))');
                                                       
                                                        mimicHuman(function()
                                                        {
                                                                clickElement(battleElements.options.magic);
                                                                mimicHuman(function()
                                                                {
                                                                        clickElement(battleElements.options.magic.getTactical());
                                                                        mimicHuman(function()
                                                                        {
                                                                                var spell = chooseSpell(meml.get('dirs').deprecating_priority);
                                                                                if(spell)
                                                                                {
                                                                                        clickElement(spell);
                                                                                        mimicHuman(function(){ clickElement($(targetActual.id)); }, false);
                                                                                }
                                                                               
                                                                                else if(spell === null) iCantDoIt();
                                                                        }, true);
                                                                }, true);
                                                        }, true);
                                                },
                                               
                                                // Returns: true if we have a target actual; else, false.
                                                attemptImmobilizations = function()
                                                {
                                                        debugSay(' -> attemptImmobilizations ('+enemiesList.length+' > '+(Math.floor(bravery/10)-1).limit(1, 9)+'):', enemiesList);
                                                       
                                                        var T = null, triggered = false;
                                                        enemiesList.every(function(item, index)
                                                        {
                                                                // We're at the last item, set targetActual
                                                                if(item)
                                                                {
                                                                        if(!targetActual && index == enemiesList.length-1)
                                                                                T = index;
                                                                       
                                                                        else if(item != targetActual && !item.local.immobilized)
                                                                        {
                                                                                debugSay('Checks cleared. Immobilizing enemy:', item);
                                                                                triggered = true;
                                                                                mimicHuman(function()
                                                                                {
                                                                                        clickElement(battleElements.options.magic);
                                                                                        mimicHuman(function()
                                                                                        {
                                                                                                clickElement(battleElements.options.magic.getTactical());
                                                                                                mimicHuman(function()
                                                                                                {
                                                                                                        var spell = chooseSpell(meml.get('dirs').immobilize_priority);
                                                                                                        if(spell)
                                                                                                        {
                                                                                                                clickElement(spell);
                                                                                                                mimicHuman(function()
                                                                                                                {
                                                                                                                        if(targetActual === null)
                                                                                                                                determineTargetActual();
                                                                                                                        clickElement($(targetActual.id));
                                                                                                                }, false);
                                                                                                        }
                                                                                                       
                                                                                                        else if(spell === null) iCantDoIt();
                                                                                                }, true);
                                                                                        }, true);
                                                                                }, true);
                                                                               
                                                                                return false;
                                                                        }
                                                                }
                                                               
                                                                return true;
                                                        });
 
                                                        if(!triggered)
                                                                debugSay('Nothing to immobilize!');
                                                       
                                                        if(targetActual || T)
                                                        {
                                                                if(T)
                                                                {
                                                                        mems.set('target', T)
                                                                        targetActual = enemiesList[mems.get('target')];
                                                                        debugSay('targetActual is now:', targetActual);
                                                                }
                                                               
                                                                return true;
                                                        }
                                                       
                                                        else false;
                                                },
                                               
                                                determineTargetActual = function()
                                                {
                                                        debugSay(' -> determineTargetActual');
                                                       
                                                        var target = null;
                                                       
                                                        enemiesList.every(function(item, index)
                                                        {
                                                                if(item && target === null) /* safety, in case everyone is immobilized */
                                                                        target = index;
                                                               
                                                                if(!item || item.local.immobilized)
                                                                        return true;
                                                               
                                                                else
                                                                {
                                                                        target = index;
                                                                        return false;
                                                                }
                                                        });
                                                       
                                                        mems.set('target', target);
                                                        targetActual = enemiesList[mems.get('target')];
                                                        debugSay('targetActual is now:', targetActual);
                                                },
                                               
                                                getHistoryElementsSinceLastSuccessfulAttack = function()
                                                {
                                                        var target = -1;
                                                        historyElements.getElements('td:nth-child(3)').every(function(item, index)
                                                        {
                                                                var text = Array.from(item.get('text'))[0];
                                                               
                                                                if(text && !text.toLowerCase().contains(' you ') && (new RegExp('.* hits .* for \\d+ .* damage\.')).test(text))
                                                                {
                                                                        target = index;
                                                                        return false;
                                                                }
                                                               
                                                                return true;
                                                        });
                                                       
                                                        if(target == -1) target = historyElements.length;
                                                        return new Elements(historyElements.slice(0, target));
                                                },
                                               
                                                calculateAttackDelta = function()
                                                {
                                                        debugSay(' -> calculateAttackDelta');
                                                       
                                                        var data = getHistoryElementsSinceLastSuccessfulAttack().getElements('td:first-child');
                                                        if(!data.length) return 0;
                                                        return data[0].get('text')[0].toInt() - data.getLast().get('text')[0].toInt();
                                                },
                                               
                                                calculateAttackFailures = function()
                                                {
                                                        debugSay(' -> calculateAttackFailures');
                                                       
                                                        // Return median
                                                        var count = 0,
                                                                data = getHistoryElementsSinceLastSuccessfulAttack();
                                                       
                                                        if(data.length)
                                                        {
                                                                data.getElements('td:nth-child(3)').each(function(item)
                                                                {
                                                                        if((new RegExp('.* misses its mark.')).test(item.get('text')[0]))
                                                                                count++;
                                                                });
                                                        }
                                                       
                                                        return count;
                                                },
                                               
                                                calculateAverageDamageTaken = function()
                                                {
                                                        debugSay(' -> calculateAverageDamageTaken');
                                                       
                                                        // Return median
                                                        var result = 0, count = 0;
                                                       
                                                        historyElements.getElements('td:nth-child(3)').each(function(item)
                                                        {
                                                                var text = item.get('text')[0];
                                                                if((new RegExp('.* hits you for \\d+ .*')).test(text))
                                                                {
                                                                        result += text.split('hits you for ')[1].split(' ')[0].toInt();
                                                                        count++;
                                                                }
                                                        });
                                                       
                                                        return !count ? 0 : (result/count).ceil();
                                                },
                                               
                                                calculateCurativeEffectiveness = function()
                                                {
                                                        debugSay(' -> calculateCurativeEffectiveness');
                                                       
                                                        // Return median
                                                        var result = [];
                                                       
                                                        historyElements.getElements('td:nth-child(3)').each(function(item)
                                                        {
                                                                var text = item.get('text')[0];
                                                                if((new RegExp('You are healed for \\d+ Health Points.')).test(text))
                                                                        result.push(text.split('You are healed for ')[1].split(' Health Points.')[0].toInt());
                                                        });
                                                       
                                                        result.sort(function(a, b){ return a-b; });
                                                        return result[(result.length/2).floor()] || 0;
                                                };
                                               
                                                if(!initChecks())
                                                {
                                                        debugSay(console.warn, 'initChecks failed. Is this a valid battle?!');
                                                        warn('initChecks failed. Is this a valid battle?!');
                                                }
                                               
                                                var historyElements = $$('div#togpane_log.bttp.btlp table tbody tr'),
                                               
                                                        enemiesList = getEnemiesList(),
                                                        battleElements = getBattleElements(),
                                                        bravery = meml.get('dirs').bravery.limit(1, 99),
                                                       
                                                        /* Strategy Heuristics */
                                                        castZone = Math.ceil(bravery/10).limit(3, 10),
                                                       
                                                        avgDmgTaken = calculateAverageDamageTaken(),
                                                        atkDelta = calculateAttackDelta(),                              // How many turns have passed without attack casts?
                                                        atkFails = calculateAttackFailures(),                   // How many times have we tried to attack and missed/failed?
                                                        curDelta = calculateCurativeEffectiveness(),    // Median cure rate
                                                       
                                                        targetActual = null,
                                                        battleOver = null;                                                              // null = not over; true = victory; false = defeat
                                               
                                                if(mems.get('scanning'))
                                                {
                                                        debugSay('Automatic scan result detected. Storing in monsterCache...');
                                                        getMonsterCache(function(monsterCacheData)
                                                        {
                                                                var key = null, valueObj = null,
                                                                getText = function(tdata, index){ return tdata[index].getElement('td:last-child').get('text').trim().toLowerCase(); },
                                                                getArray = function(tdata, index){ return getText(tdata, index).split(',').invoke('trim'); };
                                                               
                                                                historyElements.some(function(item)
                                                                {
                                                                        var el = item.getElement('td:nth-child(3)'),
                                                                                text = el.get('text');
                                                                       
                                                                        if(text.contains('Scanning'))
                                                                        {
                                                                                var tdata = el.getElements('tr');
                                                                                key = text.split(' ').slice(1).join(' ').split('...')[0].toLowerCase();
                                                                                valueObj = {
                                                                                        dmgtype: getText(tdata, 3),
                                                                                        mid: -1,
                                                                                        resistances: getArray(tdata, 5).reverse(),
                                                                                        weaknesses: getArray(tdata, 4),
                                                                                };
                                                                               
                                                                                return true;
                                                                        }
                                                                });
                                                               
                                                                debugSay('scanObject result:', key, '=>', valueObj);
                                                               
                                                                if(key && valueObj)
                                                                {
                                                                        monsterCacheData[key] = valueObj;
                                                                        mems.set('monsterCache', monsterCacheData);
                                                                }
                                                               
                                                                else
                                                                        debugSay(console.error, 'Invalid pseudo-monsterCache entry detected @ key:'+key);
                                                        });
                                                       
                                                        mems.set('scanning', false);
                                                }
                                               
                                                historyElements.getElements('td:nth-child(3)').some(function(item)
                                                {
                                                        if(item.get('text')[0] == 'You are Victorious!')
                                                        {
                                                                battleOver = true;
                                                                debugSay(console.info, 'Battle over. We are victorious.');
                                                                success('Battle over. We are victorious!');
                                                                return true;
                                                        }
                                                       
                                                        if(item.get('text')[0] == 'You have been defeated.')
                                                        {
                                                                battleOver = false;
                                                                debugSay(console.error, 'Battle over. We have been defeated.');
                                                                jsc.write('Battle over. We have been defeated! Consider lowering the bravery directive.', 'font-weight: bold; color: red;');
                                                                return true;
                                                        }
                                                       
                                                        if(item.get('text')[0] == 'You have escaped from the battle.')
                                                        {
                                                                battleOver = true;
                                                                debugSay(console.info, 'Battle over. We have fled successfully.');
                                                                success('Battle over. We\'ve successfully fled.');
                                                                return true;
                                                        }
                                                });
                                               
                                                if(battleOver !== null)
                                                        return battleOver;
                                               
                                                mems.set('status', 'running');
                                               
                                                if(!enemiesList.contains(mems.get('target')) || historyElements.getElements('td:first-child')[0].get('text')[0] == '0')
                                                        mems.set('target', null);
                                               
                                                // Check HP
                                                var HPstat = ((90 - bravery).limit(10, 90) / 100 * battleElements.stats.hp[1]) +
                                                        (.15 * avgDmgTaken).limit(0, .1 * battleElements.stats.hp[1]);
                                               
                                                if(mems.get('target'))
                                                        targetActual = enemiesList[mems.get('target')];
                                               
                                                debugSay('Calculated battle data object:', {
                                                        enemiesList: enemiesList,
                                                        spellCache: mems.get('spellCache'),
                                                        monsterCache: mems.get('monsterCache'),
                                                        battleElements: battleElements,
                                                        bravery: bravery,
                                                        avgDmgTaken: avgDmgTaken,
                                                        castZone: castZone,
                                                        atkDelta: atkDelta,
                                                        atkFails: atkFails,
                                                        curDelta: curDelta,
                                                        targetActual: targetActual,
                                                        target: mems.get('target'),
                                                        HPstat: HPstat
                                                });
                                               
                                                debugSay('~Deciding on course of action...');
                                               
                                                if(battleElements.stats.hp[0].toInt() <= HPstat)
                                                {
                                                        if(meml.get('dirs').cast_curative) attemptCure();
                                                        else debugSay(console.warn, 'cast_curative directive is false. Will not cure.');
                                                }
                                               
                                                // If we're outside our cast zone, ignore everything else and attack!
                                                else if(atkDelta > castZone)
                                                {
                                                        debugSay(console.warn, 'We\'re outside of our cast zone! ('+atkDelta+' > '+castZone+')');
                                                       
                                                        if(targetActual === null)
                                                                determineTargetActual();
                                                        attackEnemy();
                                                }
                                               
                                                else
                                                {
                                                        var bool = enemiesList.length > (Math.floor(bravery/10)-1).limit(1, 9),
                                                                bImmo = meml.get('dirs').cast_immobilizations;
                                                       
                                                        // Cast any immobilizations (must be run multiple times; replenish MP if necessary)
                                                        if(!bool || !bImmo || bool && attemptImmobilizations())
                                                        {
                                                                if(!bImmo) debugSay(console.warn, 'cast_immobilizations directive is false. Will not cast immobilizing spells.');
                                                               
                                                                // If targetActual is still null, find a suitable target
                                                                if(targetActual === null)
                                                                        determineTargetActual();
                                                               
                                                                // Cast any deprecating spells (replenish MP if necessary)
                                                                if(!targetActual.local.deprecating && (targetActual.isBoss || targetActual.level >= battleElements.stats.level-Math.round(5-5*bravery/99)))
                                                                {
                                                                        if(meml.get('dirs').cast_deprecating) attemptDeprecating();
                                                                        else debugSay(console.warn, 'cast_deprecating directive is false. Will not cast depricating spells (exclusing immobilizations).');
                                                                }
                                                               
                                                                // Cast any focusing if necessary (replenish MP if necessary)
                                                                else if(!battleElements.playerActiveStatus.focus && atkFails > meml.get('dirs').miss_threshold)
                                                                        attemptFocus();
                                                               
                                                                // Attack (replenish MP if necessary)
                                                                else attackEnemy();
                                                        }
                                                }
                                               
                                                debugSay(console.warn, 'Main AI process terminated (successfully). Memory dump:', mems.getAll());
                                                return true;
                                        };
                                       
                                mems.init(STOREKEY);
                                meml.init(STOREKEY);
                               
                                jsc.create(function(command)
                                {
                                        jsc.write('$> '+command, 'padding-left: 5px;');
                                       
                                        if(!ready)
                                                return error('not ready!');
                                       
                                        var cmd  = command.split(' '),
                                                args = cmd.slice(1),
                                                cmd  = cmd[0].toLowerCase();
                                       
                                        debugSay('Received command:', cmd, 'with args:', args);
                                       
                                        if(cmd == 'help')
                                        {
                                                jsc.write('Available commands:', 'margin: 10px 0;');
                                               
                                                var sayCmdHelp = function(cmd, helptext)
                                                {
                                                        jsc.write(cmd, 'color: purple; padding-left: 3px;');
                                                        jsc.write(helptext, 'padding-left: 4px;');
                                                };
                                               
                                                sayCmdHelp('help', 'Display this help text.');
                                                sayCmdHelp('clear', 'Clears this console window.');
                                                sayCmdHelp('config [[get key]|[set key value]]', 'Allows user to get/set a configuration directive.');
                                                sayCmdHelp('export [target]', 'Prints the target data to the console for importing into other bots.');
                                                sayCmdHelp('import [target data]', 'Replaces the targeted data with the supplied data parameter.');
                                                sayCmdHelp('lookup [monster_name]', 'Returns data on a monster (weaknesses, etc).');
                                                sayCmdHelp('start [[mode] | [mode args]]', 'Starts the bot. If mode is not passed, defaults to init_mode directive. Cannot be called if the bot is already running.');
                                                sayCmdHelp('stop', 'Stops the bot. If you\'re in the middle of a battle or something, you can have the bot resume with the <span style="font-weight: bold">start battle</span> command.');
                                                sayCmdHelp('reset', 'Resets the bot, clears the cache, and returns all settings/directives to their defaults.');
                                                                                               
                                                jsc.write('Note: omit all brackets ([ and ]) above when supplying arguments with commands (unless they\'re part of your command). Also, when you see "x|y", it translates to "x or y".', 'margin-top: 15px;');
                                                jsc.write('If you need the list of configuration directives, need help, have questions, comments, suggestions, etc, '+
                                                anchor(botURI+'/blob/master/README.md', 'click here')+' (you really should click it and learn how to use the bot anyway).');
                                                jsc.write('DISCLAIMER: I am not responsible for anything at all whatsoever in the slightest pertaining to anything you or anyone else can or could ever possibly imagine. If you get caught/banned/screwed for some reason (unlikely), '+anchor(botURI+'/issues', 'give me a head\'s up')+' so I can make sure it doesn\'t happen to anyone else ;)', 'color: red');
                                                jsc.write('[ written by some guy who wants to be the H (sgwWTBTH) ]', 'text-align: center; margin-top: 5px;');
                                        }
                                       
                                        else if(cmd == 'clear')
                                        {
                                                if(args[0] == 'cache')
                                                {
                                                        mems.clear();
                                                        success('Session storage (not the directives) values cleared');
                                                        warn('it is recommended you reset the console or refresh the page before continuing!');
                                                }
                                               
                                                else jsconsole.clear();
                                        }
                                       
                                        else if(cmd == 'config')
                                        {
                                                if(['get', 'set'].contains(args[0]))
                                                {
                                                        if(args[0] == 'get')
                                                        {
                                                                if(!meml.get('dirs').hasOwnProperty(args[1]))
                                                                        warn('directive "'+args[1]+'" does not exist');
                                                                else
                                                                {
                                                                        var result = meml.get('dirs')[args[1]];
                                                                        if(typeOf(result) == 'array') result = '['+result+']';
                                                                        success('Directive '+args[1]+' = '+result);
                                                                }
                                                        }
                                                       
                                                        else if(args[0] == 'set')
                                                        {
                                                                var result = JSON.parse.attempt(args.slice(2).join(' ')),
                                                                        dirs = meml.get('dirs');
                                                               
                                                                if(result === null)
                                                                        result = args.slice(2).join(' ');
 
                                                                dirs[args[1]] = result;
                                                                meml.set('dirs', dirs);
                                                                success('Directive "'+args[1]+'" set to: '+JSON.stringify(result));
                                                        }
                                                }
                                               
                                                else invalid();
                                        }
                                       
                                        else if(cmd == 'start')
                                        {
                                                if(args[0] == 'battle')
                                                {
                                                        if(!args[1])
                                                        {
                                                                var battle = doBattle();
                                                                if(!battle || $('ckey_continue') && !$('ckey_continue').get('onclick').contains('continue')) mems.set('status', 'stopped');
                                                                if($('ckey_continue')) clickElement($('ckey_continue'));
                                                        }
                                                       
                                                        else if(args[1] == 'arena')
                                                        {
                                                                error('Not implemented yet. Sorry.');
                                                        }
                                                       
                                                        else if(args[1] == 'grind')
                                                        {
                                                                error('Not implemented yet. Sorry.');
                                                        }
                                                       
                                                        else if(args[1] == 'cry')
                                                        {
                                                                error('Not implemented yet. Sorry.');
                                                        }
                                                       
                                                        else invalid();
                                                }
                                               
                                                else invalid();
                                        }
                                       
                                        else if(cmd == 'stop')
                                        {
                                                if(MCXHR.isRunning() || SCXHR.isRunning())
                                                {
                                                        _truedeath(MCXHR);
                                                        _truedeath(SCXHR);
                                                        success('XHR cache operations halted successfully');
                                                }
                                               
                                                if($$('._DG-countdown').length)
                                                {
                                                        $$('._DG-countdown').each(function(item)
                                                        {
                                                                clearInterval(item.retrieve('_-countdown'));
                                                                item.removeClass('_DG-countdown');
                                                                if(!item.get('text').contains('[stopped]'))
                                                                        item.set('text', item.get('text')+' [stopped]');
                                                        });
                                                       
                                                        success('Mimic human: countdown operations halted successfully');
                                                }
                                               
                                                if(timeout_handler)
                                                {
                                                        clearTimeout(timeout_handler);
                                                        timeout_handler = 0;
                                                        timeout_funct = null;
                                                        success('Timeout operations halted successfully');
                                                }
                                               
                                                if(mems.get('status') != 'stopped')
                                                {
                                                        mems.set('status', 'stopped');
                                                        success('Status set to: "stopped"');
                                                }
                                        }
                                       
                                        else if(cmd == 'import')
                                        {
                                                if(args[0] == 'directives' && args[1])
                                                {
                                                        var data = JSON.parse.attempt(args.slice(1).join(' '));
                                                       
                                                        if(data && typeOf(data) == 'object')
                                                        {
                                                                meml.set('dirs', data);
                                                                return success('Import succeeded');
                                                        }
                                                }
                                               
                                                invalid();
                                        }
                                       
                                        else if(cmd == 'export')
                                        {
                                                if(args[0] == 'directives')
                                                {
                                                        jsc.write('Copy (and eventually paste) the following block in its entirety:');
                                                        info(JSON.stringify(meml.get('dirs')));
                                                }
                                               
                                                else invalid();
                                        }
                                       
                                        else if(cmd == 'reset')
                                        {
                                                if(mems.get('status') == 'running')
                                                        error('session is in a dirty state. Stop the bot and try again.');
                                                else
                                                {
                                                        _truedeath(MCXHR);
                                                        _truedeath(SCXHR);
                                                       
                                                        mems.clear();
                                                        meml.clear();
                                                       
                                                        jsconsole.clear();
                                                        startup(true);
                                                }
                                        }
                                       
                                        else if(cmd == 'lookup')
                                        {
                                                if(!args.length)
                                                        return invalid();
                                               
                                                var monster = args.join(' ').trim();
                                                jsc.write('Looking up "'+monster.capitalize()+'"...');
                                               
                                                getMonsterCache(function(data)
                                                {
                                                        if(!data[monster.toLowerCase()])
                                                                warn('monster "'+monster.capitalize()+'" was not found');
                                                       
                                                        else
                                                        {
                                                                data = data[monster.toLowerCase()];
                                                               
                                                                var w = data.weaknesses.join(', '),
                                                                        r = data.resistances.join(', ');
                                                               
                                                                info('Name: '+monster+(data.mid >= 0 ? ' ('+data.mid+')' : ''));
                                                                info('Melee Attack: '+(data.dmgtype.toString().length ? data.dmgtype : '(unknown)'));
                                                                info('Weak against (descending order): '+(w.length ? w : ' (nothing)'));
                                                                info('Resistant to (ascending order): '+(r.length ? r : ' (nothing)'));
                                                        }
                                                });
                                        }
                                       
                                        else if(cmd == 'skip')
                                        {
                                                if(args[0] == 'timeout')
                                                {
                                                        if(timeout_funct)
                                                        {
                                                                clearTimeout(timeout_handler);
                                                               
                                                                $$('._DG-countdown').each(function(item)
                                                                {
                                                                        clearInterval(item.retrieve('_-countdown'));
                                                                        item.removeClass('_DG-countdown');
                                                                        if(!item.get('text').contains('[skipped]'))
                                                                                item.set('text', item.get('text')+' [skipped]');
                                                                });
                                                               
                                                                warn('timeout skipped. Immediately executing next procedure (don\'t do this too often)');
                                                                jsc.write('Note: if you do not wish to wait a few seconds between procedure executions, set the "mimic_human" directive to false (<span style="font-weight: bold;">NOT recommended</span>).');
                                                                timeout_funct();
                                                        }
                                                       
                                                        else error('there is currently no active timeout');
                                                }
                                               
                                                else if(args[0] == 'retry')
                                                {
                                                        if(MCXHR.timeout_handler || SCXHR.timeout_handler)
                                                        {
                                                                if(MCXHR.timeout_handler)
                                                                {
                                                                        clearTimeout(MCXHR.timeout_handler);
                                                                        MCXHR.timeout_handler = 0;
                                                                        MCXHR.send();
                                                                }
                                                               
                                                                if(SCXHR.timeout_handler)
                                                                {
                                                                        clearTimeout(SCXHR.timeout_handler);
                                                                        SCXHR.timeout_handler = 0;
                                                                        SCXHR.send();
                                                                }
                                                        }
                                                       
                                                        else error('there are currently no pending XHR requests');
                                                }
                                               
                                                else invalid();
                                        }
                                       
                                        else if(cmd == 'sleep')
                                        {
                                                error('Not implemented yet. Sorry.');
                                        }
                                       
                                        else if(cmd == 'debug' && meml.get('dirs').enable_debug)
                                        {
                                                if(args[0] == 'force' && args[1] !== undefined && args[2] !== undefined)
                                                {
                                                        if(args[1] == 'status' && ['running', 'stopped'].contains(args[2]))
                                                                mems.set('status', args[2]);
                                                }
                                               
                                                else invalid();
                                        }
                                       
                                        else
                                                error('unsupported command "'+cmd+'"');
                                });
                               
                                var startup = function(reset)
                                {
                                        ready = false;
                                        meml.set('dirs', Object.merge({}, defaultDirs, meml.get('dirs') || {}));
                                       
                                        debugSay(console.info, '[[ make sure the "preserve log upon navigation" option is checked; start chrome with logging enabled if you plan to submit: --enable-logging --v=1 ]]');
                                        debugSay('Initializing using directive cache:', meml.get('dirs'));
                                       
                                        if(meml.get('dirs').auto_resize)
                                                window.resizeTo(1002, 893);
                                       
                                        if(meml.get('dirs').clean_mode)
                                        {
                                                $$('body div.stuffbox.csp div.clb img.cw')[0].setStyle('opacity', 0);
                                                document.title = 'HV-bot';
                                        }
                                       
                                        jsc.__HCOUNT = 0;
                                        jsc.__HISTORY = mems.has('consoleHistory') ? mems.get('consoleHistory') : [];
                                        jsc._textarea.set('html', mems.has('consoleContent') ? mems.get('consoleContent') : '');
                                        jsc._textarea.getElements('.uncarriable').dispose();
                                        jsc.scrollBottom();
                                       
                                        if(jsc._textarea.get('html').length)
                                                jsc.write(' ', 'margin-top: 7px; margin-bottom: 3px; background-color: black;" class="uncarriable -_-lb');
                                       
                                        if(reset)
                                                info('[ hard reset ]');
                                       
                                        if(!mems.has('monsterCache') || !mems.has('spellCache'))
                                        {
                                                info('Updating data caches, this could take a few seconds (console GET errors to be fixed in a later version)...');
                                                reset = true;
                                        }
                                       
                                        getSpellCache(function()
                                        {
                                                getMonsterCache(function()
                                                {
                                                        // Possible statuses: running & stopped
                                                        debugSay('Status on entry:', mems.get('status'));
                                                       
                                                        if(reset || !jsc._textarea.get('html').length)
                                                        {
                                                                jsc.write('HentaiVerse "IWBTH" mage bot -- version 0.9 -- by sgwWTBTH', 'color: purple;');
                                                                jsc.write(botURI, 'color: blue;', true);
                                                                jsc.write('Please '+anchor(botURI+'/issues', 'report')+' any comments, suggestions, bugs, et cetera!');
                                                               
                                                                switch(mems.get('status'))
                                                                {
                                                                        case 'running': // User is in the middle of something -- typical game refresh
                                                                                jsc.write('Cache entry found. Status is "running". Fighting your battles...', 'color: purple;');
                                                                                break;
                                                                       
                                                                        default:                // User stopped the bot/initial load
                                                                                jsc.write('Type "help" for assistance');
                                                                                jsc.write('Awaiting your command...', 'font-weight: bold;');
                                                                                setStatus('stopped');
                                                                                break;
                                                                }
                                                        }
                                                       
                                                        // Integrity checks
                                                       
                                                       
                                                        // Action time!
                                                        ready = true;
                                                        switch(mems.get('status'))
                                                        {
                                                                case 'running':
                                                                        jsc.write('Resumed. Fighting your battles...', 'color: purple;" class="uncarriable');
                                                                        var battle = doBattle();
                                                                        if(!battle || $('ckey_continue') && !$('ckey_continue').get('onclick').contains('continue')) mems.set('status', 'stopped');
                                                                        if($('ckey_continue')) clickElement($('ckey_continue'));
                                                                        break;
                                                               
                                                                default:
                                                                        mems.set('status', 'stopped'); /* just in case (also accounts for console resets, etc.) */
                                                                        if(jsc._textarea.getElement('> :last-child').hasClass('-_-lb'))
                                                                                info('Resumed. Your move.', '" class="uncarriable');
                                                                        break;
                                                        }
                                                });
                                        });    
                                };
                               
                                window.addEvent('unload', function()
                                {
                                        mems.set('consoleHistory', jsc.__HISTORY);
                                        mems.set('consoleContent', jsc._textarea.get('html'));
                                });
                               
                                startup();
                        });
                }
        },
       
/*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*- easy customization ends here -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*/
       
        load: function(module)
        {
                if(modules._raw[module])
                {
                        console.warn('Loaded custom userscript module "'+module+'"!');
                        modules._raw[module]();
                }
 
                else console.error('Custom userscript module "'+module+'" was not found!');
        }
};
 
var clickElement = function(el, fn)
{
        if(!el) throw 'Cannot click element. Element "el" does not exist!';
        var evt = el.ownerDocument.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, el.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        if(fn) fn();
        return el.dispatchEvent(evt);
};
 
String.prototype.matches = function(str)
{
        var matchers = { '\\':'\\\\', '.':'\.', '*':'.*' };
        str = str.split('');
       
        for(var key in matchers)
                if(matchers.hasOwnProperty(key))
                        str.forEach(function(item, index){ if(item == key) str[index] = matchers[key]; });
       
        var regex = new RegExp('^'+str.join('')+'$', 'i');
        return regex.test(this);
};
 
// MooTools
var moo = {
        loaded: function(){ return !!window.MooTools; },
       
        load: function(fn)
        {
                if(moo.loaded())
                {
                        console.warn('Attempted to reload the MooTools library, which is not allowed.');
                        return false;
                }
               
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function()
                {
                        if(xhr.readyState == 4 && xhr.status == 200)
                        {
                                eval.call(window, xhr.responseText);
                                if(fn) fn();
                        }
                };
               
                xhr.open("GET", 'https://ajax.googleapis.com/ajax/libs/mootools/1.4.5/mootools-yui-compressed.js', true);
                xhr.send();
                return true;
        }
},
 
// JavaScript Web Storage
memory = {
        _DATACACHE: { local: {}, session: {} },
        _DATACNAME: 'CHROMEI_D-cache',
       
        local: {
                get: function(key)
                {
                        return memory._DATACACHE.local[key];
                },
               
                getAll: function()
                {
                        return memory._DATACACHE.local;
                },
               
                set: function(key, value)
                {
                        memory._DATACACHE.local[key] = value;
                        memory.local.writeout();
                        return memory.local;
                },
               
                has: function(key)
                {
                        return Object.keys(memory._DATACACHE.local).contains(key);
                },
               
                unset: function(key)
                {
                        delete memory._DATACACHE.local[key];
                        memory.local.writeout();
                        return memory.local;
                },
               
                clear: function()
                {
                        memory._DATACACHE.local = {};
                        memory.local.writeout();
                        return memory.local;
                },
               
                writein: function()
                {
                        memory._DATACACHE.local = JSON.parse(localStorage.getItem(memory._DATACNAME)) || {};
                        return memory.local;
                },
               
                writeout: function()
                {
                        localStorage.setItem(memory._DATACNAME, JSON.stringify(memory._DATACACHE.local));
                        return memory.local;
                },
               
                init: function(id)
                {
                        memory.setWriteID(id);
                        memory.local.writein();
                        return memory.local;
                }
        },
       
        session: {
                get: function(key)
                {
                        return memory._DATACACHE.session[key];
                },
               
                getAll: function()
                {
                        return memory._DATACACHE.session;
                },
               
                set: function(key, value)
                {
                        memory._DATACACHE.session[key] = value;
                        memory.session.writeout();
                        return memory.session;
                },
               
                has: function(key)
                {
                        return Object.keys(memory._DATACACHE.session).contains(key);
                },
               
                unset: function(key)
                {
                        delete memory._DATACACHE.session[key];
                        memory.session.writeout();
                        return memory.session;
                },
               
                clear: function()
                {
                        memory._DATACACHE.session = {};
                        memory.session.writeout();
                        return memory.session;
                },
               
                writein: function()
                {
                        memory._DATACACHE.session = JSON.parse(sessionStorage.getItem(memory._DATACNAME)) || {};
                        return memory.session;
                },
               
                writeout: function()
                {
                        sessionStorage.setItem(memory._DATACNAME, JSON.stringify(memory._DATACACHE.session));
                        return memory.session;
                },
               
                init: function(id)
                {
                        memory.setWriteID(id);
                        memory.session.writein();
                        return memory.session;
                }
        },
       
        setWriteID: function(id){ memory._DATACNAME = id; }
},
 
// JS Console
jsconsole = {
        _textarea: null,
        _input: null,
        _button: null,
       
        __HCOUNT: 0,
        __HISTORY: [],
       
        create: function(exec, parent, id)
        {
                if(!document.getElementById(id))
                {
                        var chars = '0123456789ABCDEFGHIJ_KLMNOPQRSTUVW-XTZabcdefghiklmnopqrstuvwxyz';
                        var string_length = Math.floor(Math.random() * 8) + 4;
                        var randomstring = '';
                       
                        for(var i=0; i<string_length; i++)
                        {
                                var rnum = Math.floor(Math.random() * chars.length);
                                randomstring += chars.substring(rnum, rnum+1);
                        }
                       
                        var div = document.createElement('div');
                        div.id = id || randomstring;
                        div.innerHTML = '<div style="resize: vertical; text-align: left; overflow: hidden; overflow-y: scroll; display: block; width: 90%; height: 82px; background-color: #EEE; border: solid gray 1px; margin: 5px auto 1px auto; padding: 5px; padding-top: 0;"></div>'+
                                '<input type="text" style="width: 80%;" />'+
                                '<button type="button" disabled="disabled">Execute</button>';
                       
                        parent = parent || document.body;
                        parent.appendChild(div);
                       
                        jsconsole._textarea = div.getElementsByTagName('div')[0];
                        jsconsole._input = div.getElementsByTagName('input')[0];
                        jsconsole._button = div.getElementsByTagName('button')[0];
                       
                        var change = function()
                        {
                                if(jsconsole._input.value.length)
                                        jsconsole._button.disabled = false;
                                else
                                        jsconsole._button.disabled = true;
                        },
                       
                        execute = function()
                        {
                                var val = jsconsole._input.value;
                                jsconsole._input.value = '';
                               
                                if(val.length && val != jsconsole.__HISTORY[jsconsole.__HISTORY.length-1])
                                        jsconsole.__HISTORY.push(val);
                               
                                jsconsole.__HCOUNT = 0;
                                exec(val);
                        };
                       
                        jsconsole._input.addEventListener('focus', change);
                        jsconsole._input.addEventListener('blur', change);
                        jsconsole._input.addEventListener('keyup', function(e)
                        {
                                var stop = function()
                                {
                                        e.preventDefault();
                                        e.stopPropagation();
                                },
                               
                                len = jsconsole.__HISTORY.length;
                               
                                if(e.keyCode == 13)             // Enter
                                {
                                        stop();
                                        execute();
                                }
                               
                                else if(e.keyCode == 38)        // Up
                                {
                                        stop();
                                        if(len > 0 && jsconsole.__HCOUNT < jsconsole.__HISTORY.length)
                                                jsconsole._input.value = jsconsole.__HISTORY[(len-1)-jsconsole.__HCOUNT++];
                                }
                               
                                else if(e.keyCode == 40)        // Down
                                {
                                        stop();
                                        if(len > 1 && jsconsole.__HCOUNT > 1)
                                                jsconsole._input.value = jsconsole.__HISTORY[len-(--jsconsole.__HCOUNT)];
                                        else
                                        {
                                                jsconsole.__HCOUNT = 0;
                                                jsconsole._input.value = '';
                                        }
                                }
                               
                                change();
                        });
                       
                        jsconsole._button.addEventListener('click', execute);
                }
               
                return jsconsole;
        },
       
        write: function(data, styles, link)
        {
                if(jsconsole._textarea)
                {
                        data    = data || ' ';
                        styles  = styles && styles.match('^((.*(\s|;)color:)|(color:)).*$') ? styles : ('color: black; '+styles);
                       
                        jsconsole._textarea.innerHTML += '<'+(link?'a target="_blank" href="'+data+'"':'p')+
                                ' style="word-wrap: break-word; padding-bottom: 0; '+styles+'">'+data+'</'+(link?'a':'p')+'>';
                }
               
                jsconsole.scrollBottom();
                return jsconsole;
        },
       
        clear: function()
        {
                while(jsconsole._textarea.hasChildNodes())
                        jsconsole._textarea.removeChild(jsconsole._textarea.lastChild);
        },
       
        scrollBottom: function(){ jsconsole._textarea.scrollTop = 99999999999; }
};
 
modules.init();