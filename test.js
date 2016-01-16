'use strict'

let diplomat = require('./diplomat.js')

class Test extends diplomat {
  test (flags, phrase) {
    if (flags['sad']) {
      console.log('Aww.')
    } else {
      console.log('Yay!')
    }
    if (phrase) {
      console.log(phrase)
    }
    console.log(flags['dream'])
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
        'default': 'false',
        'desc': 'Determine whether I am sad today.'
      },

      'dream': {
        'type': 'string',
        'default': "I didn't have a dream last night.",
        'desc': 'What did I dream last night?'
      }
    }
  }
}

let test = new Test()
test.parse(process.argv)
