"use strict";
/**
 * Created by Kyle Fahringer on 1/15/16.
 */

class Diplomat {
  constructor(args = []){
    // first, we locate the command passed

    // remove node from the arguments, if the script was called using "node [script] [args]"
    if (args[0] == 'node') {
      args.shift()
    }

    // then, remove the script name from the arguments
    args.shift()

    // leaving just the arguments
    let command = args.shift()

    if (typeof this[command] === 'function'){
      // TODO: Parse the arguments further
      this[command]()
    } else {
      console.log(`Sorry, but ${command} is not a command.`)
      console.log(`Please refer to the help below for correct usage:`)
      this.help()
    }
  }

  help(args = {}){
    let methods = Object.getOwnPropertyNames(this)
    console.log(`Help for ${this.constructor.name}:`)
    console.log(methods)
    methods.forEach((m) => {
      if (m === 'constructor' || (m.contains('help') && m != 'help')){
        return
      }
      console.log(m)
      console.log(`    ${m} - ${this[`${m}_help`]()['short']}`)
    })
  }

  help_help() {
    return {
      short: 'Print this help screen.',
      long: 'This command helps you find the definitions for other commands.'
    }
  }
}

module.exports = Diplomat