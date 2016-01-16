'use strict'
/**
 * Created by Kyle Fahringer on 1/15/16.
 */

let diplomat = require('./diplomat.js')

class Test extends diplomat {
  test (args, flags) {
    if (flags['sad']) {
      console.log('Aww.')
    } else {
      console.log('Yay!')
    }
  }

  test_help () {
    return {
      'short': 'This is a short bit of information.',
      'long': 'This is a longer string. It will be displayed when you run help for a command.'
    }
  }

  test_flags () {
    return {
      'sad': {
        'type': 'boolean',
        'default': 'false'
      }
    }
  }
}

let test = new Test()
test.parse(process.argv)
