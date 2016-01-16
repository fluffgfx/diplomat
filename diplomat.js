'use strict'
/**
 * Created by Kyle Fahringer on 1/15/16.
 */

class Diplomat {
  parse (args = []) {
    // first, we locate the command passed

    // remove node from the arguments, if the script was called using "node [script] [args]"
    if (args[0] === 'node') {
      args.shift()
    }

    // then, remove the script name from the arguments
    args.shift()

    // leaving just the arguments
    let command = args.shift()

    if (typeof command === 'undefined') {
      console.log('Please pass a command.')
      return
    }

    if (typeof this[command] === 'function') {
      let nextIsFlag = false
      let nextFlag
      let flags = {}
      let opts = []
      let command_flags = this[`${command}_flags`]()
      args.forEach((o) => {
        if (nextIsFlag) {
          o = this.verify_type(o, command_flags[nextFlag]['type'])
          if (o === 'error') {
            console.log(`${o} is not a valid value for ${nextFlag}.`)
            console.log(`Please refer to the help below for correct usage:`)
            this.help()
            return
          }
          flags[nextFlag] = o
          nextIsFlag = false
        } else if (o.includes('--')) {
          o = o.replace('--', '')
          if (typeof command_flags[o] !== 'undefined') {
            nextIsFlag = true
            nextFlag = o
          } else {
            console.log(`${o} is not a valid flag.`)
            console.log(`Please refer to the help below for correct usage:`)
            this.help()
            return
          }
        } else {
          opts.push(o)
        }
      })
      if (nextIsFlag) {
        console.log(`You didn't specify a value for ${nextFlag}.`)
        console.log('Please refer to the help below for the correct usage:')
        this.help()
        return
      }
      this[command](opts, flags)
    } else {
      console.log(`${command} is not a command.`)
      console.log(`Please refer to the help below for correct usage:`)
      this.help()
      return
    }
  }

  verify_type (o, type) {
    switch (type) {
      case 'boolean':
        if (o === 'true') {
          return true
        } else if (o === 'false') {
          return false
        } else {
          return 'error'
        }
        break
      case 'string':
        return o
      case 'number':
        if (isNaN(o)) {
          return o
        } else {
          return 'error'
        }
        break
      default:
        return o
    }
  }

  help (args, flags) {
    if (args) {
      args.forEach((a) => {
        console.log(`Help for ${this.constructor.name}.${a}:`)
        console.log('---')
        console.log(this[`${a}_help`]()['long'])
        console.log('---')
        console.log('Options:')
        // TODO: Iterate over options
      })
    } else {
      let methods = Object.getOwnPropertyNames(this.constructor.prototype)
      console.log(`Help for ${this.constructor.name}:`)
      methods.forEach((m) => {
        if (m === 'constructor' || m === 'verify_type' || m.includes('help') || m.includes('flags')) {
          return
        }
        console.log(`-    ${m}: ${this[`${m}_help`]()['short']}`)
      })
      console.log(`-    help: ${this['help_help']()['short']}`)
    }
  }

  help_help () {
    return {
      short: 'Print this help screen.',
      long: 'This command helps you find the definitions for other commands.'
    }
  }
}

module.exports = Diplomat
