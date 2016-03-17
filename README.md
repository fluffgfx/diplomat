# Diplomat
Diplomat makes command line interfaces for nodeJS easy. It's like Thor, but not a norse god and not written for ruby. And each parser is an object, instead of calling a class method directly, because I always thought that was weird.

## How easy?
This easy:

```javascript
let diplomat = require('diplomat-cli')

class Echoer extends diplomat {
    echo (flags, message) {
        if (flags['reverse']) {
            console.log(message.split('').reverse().join(''))
        } else {
            console.log(message)
        }
    }

    echo_help () {
        return {
            'short': 'Echoes your message.',
            'long': 'Echoes your message, with pizzazz. Is magical.'
        }
    }

    echo_flags () {
        return {
            'reverse': {
                'type': 'boolean',
                'default': 'false'
            }
        }
    }
}

let echobot = new Echoer()
echobot.parse(process.argv)
```

## Installation
    npm install diplomat-cli

## Development
This is all written in ES6 and transpiled using babel, so clone the repository and use `babel-node` to test and `node compile` to compile. Or `babel -o diplomat-compiled.js diplomat.js`. Whatever floats your boat.

## Disclaimer
This is version 0.1. I'm fairly sure I've ironed out the bugs, but there aren't very many types yet and there's still work to be done. Any features suggestions or issues can be reported using the github issue tracker. Thank you!
