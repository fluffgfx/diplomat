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
      // The lines below are bad, and need a refactor
      // It's almost like this was hacked together in two days
      // But since the program itself is only barely over 200 lines,
      // I'm going to say this is OK for an 0.1 version.
      // Define some variables we're going to use later
      let nextIsFlag = false
      let nextFlag
      let flags = {}
      let opts = []
      let command_flags = this[`${command}_flags`]()
      let quoted = false
      let full_quote = ''

      // Iterate over each of the remaining arguments.
      args.forEach((o) => {
        if (o[0] === '-' && o[1] === '-') {
          // It's a flag!
          o = o.replace('--', '') // Maybe I should just be less lazy and not replace all the dashes, but eh
          if (nextIsFlag) {
            // Special case for boolean flags (see below, under else if (nextIsFlag) {})
            if (command_flags[nextFlag]['type'] === 'boolean') {
              // Don't unset nextIsFlag because this is also a flag, but do set nextFlag to its proper self
              flags[nextFlag] = true
              nextFlag = o
            } else {
              console.log(`You didn't specify a value for ${nextFlag}.`)
              console.log('Please refer to the help below for the correct usage:')
              this.help()
              return
            }
          }
          if (typeof command_flags[o] !== 'undefined') {
            nextIsFlag = true
            nextFlag = o
          } else {
            console.log(`${o} is not a valid flag.`)
            console.log(`Please refer to the help below for correct usage:`)
            this.help()
            return
          }
        } if (quoted) {
          // If quoted is set, that means that some argument earlier started with a quote, so we wait until we find
          // an end quote to stop parsing them as separate arguments, instead appending each argument to full_quote
          full_quote = `${full_quote} ${o.replace('"', '')}`
          if (o[o.length - 1] === '"') {
            // We've got an end quote
            quoted = false
            if (nextIsFlag) {
              let o_v = this.internal_verify_type(o, command_flags[nextFlag]['type'])
              if (o_v === 'error') {
                if (command_flags[nextFlag]['type'] === 'boolean') {
                  flags[nextFlag] = true
                  nextIsFlag = false
                  if (this[command].length < opts.length) {
                    console.log(`${command} does not take that many arguments.`)
                    console.log(`Please refer to the help below for correct usage:`)
                    this.help()
                    return
                  }
                  opts.push(o)
                } else {
                  console.log(`${o} is not a valid value for ${nextFlag}.`)
                  console.log(`Please refer to the help below for correct usage:`)
                  this.help()
                  return
                }
              }
              flags[nextFlag] = o_v
              nextIsFlag = false
            } else {
              if (this[command].length < opts.length) {
                console.log(`${command} does not take that many arguments.`)
                console.log(`Please refer to the help below for correct usage:`)
                this.help()
                return
              }
              opts.push(o)
            }
          }
        } else if (nextIsFlag) {
          // nextIsFlag being set means that the previous argument was prefixed with --, meaning it's a flag.
          // The if () {} statement below sets nextIsFlag, and this should always theoretically unset it.
          // Therefore, we should parse this argument as a flag, and place it in the flags object,
          // next to the flag that presumably owns it.
          let o_v = this.internal_verify_type(o, command_flags[nextFlag]['type'])
          // internal_verify_type iterates over the possible types defined in the method_types method,
          // and returns an object conforming to that type, unless it returns error.
          if (o_v === 'error') {
            // The below is special case for boolean flags.
            // This is because boolean flags, simply by being defined, set their own value to true.
            // Therefore, no second argument should be necessary, and the next argument should be treated as
            // a normal argument.
            // If it was a flag, it was parsed above, so we just assume it's a normal argument.
            if (command_flags[nextFlag]['type'] === 'boolean') {
              flags[nextFlag] = true
              nextIsFlag = false
              if (this[command].length < opts.length) {
                console.log(`${command} does not take that many arguments.`)
                console.log(`Please refer to the help below for correct usage:`)
                this.help()
                return
              }
              opts.push(o)
            } else {
              console.log(`${o} is not a valid value for ${nextFlag}.`)
              console.log(`Please refer to the help below for correct usage:`)
              this.help()
              return
            }
          }
          flags[nextFlag] = o_v
          nextIsFlag = false
        } else if (o[0] === '"') {
          quoted = true
          full_quote = o.replace('"', '')
        } else {
          if (this[command].length < opts.length) {
            console.log(`${command} does not take that many arguments.`)
            console.log(`Please refer to the help below for correct usage:`)
            this.help()
            return
          }
          opts.push(o)
        }
      })

      // If the last argument was a flag, we need to make sure it was resolved
      if (nextIsFlag) {
        if (command_flags[nextFlag]['type'] === 'boolean') {
          flags[nextFlag] = true
          nextIsFlag = false
        } else {
          console.log(`You didn't specify a value for ${nextFlag}.`)
          console.log('Please refer to the help below for the correct usage:')
          this.help()
          return
        }
      }

      // This will iterate over the flags and make sure each one that was required was passed, and set the
      // defaults for the ones that were not.
      Object.keys(command_flags).forEach((f) => {
        if (typeof flags[f] !== 'undefined' || typeof command_flags[f]['default'] === 'undefined') {
          return
        } else if (typeof command_flags[f]['required'] !== 'undefined' && command_flags[f]['required']) {
          console.log(`You did not pass required argument ${f}.`)
          console.log('Please refer to the help below for the correct usage:')
          this.help()
          return
        } else {
          flags[f] = this.internal_verify_type(command_flags[f]['default'])
        }
      })

      // Finally, call the command.
      this[command](flags, ...opts)
    } else {
      console.log(`${command} is not a command.`)
      console.log(`Please refer to the help below for correct usage:`)
      this.help()
      return
    }
  }

  internal_verify_type (o, type) {
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
        if (!isNaN(o)) {
          return parseInt(o, 10)
        } else {
          return 'error'
        }
        break
      default:
        return o
    }
  }

  help (flags, command) {
    if (command) {
      console.log(`Help for ${this.constructor.name}.${command}:`)
      console.log(this[`${command}_help`]()['long'])
      console.log('')
      if (Object.keys(this[`${command}_flags`]()).length > 0) {
        console.log('Options:')
        Object.keys(this[`${command}_flags`]()).forEach((f) => {
          if (typeof this[`${command}_flags`]()[f]['desc'] !== 'undefined') {
            console.log(`-    --${f} [${this[`${command}_flags`]()[f]['type']}]: ${this[`${command}_flags`]()[f]['desc']}`)
          } else {
            console.log(`-    --${f} [${this[`${command}_flags`]()[f]['type']}]`)
          }
        })
      }
    } else {
      let methods = Object.getOwnPropertyNames(this.constructor.prototype)
      console.log(`Help for ${this.constructor.name}:`)
      methods.forEach((m) => {
        if (m === 'constructor' || m.includes('internal') || m.includes('help') || m.includes('flags')) {
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

  help_flags () {
    return {}
  }
}

module.exports = Diplomat
