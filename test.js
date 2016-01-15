"use strict";
/**
 * Created by Kyle Fahringer on 1/15/16.
 */

let diplomat = require('./diplomat.js')

class Test extends diplomat {
  test(){
    console.log('Yay!')
  }

  test_help(){
    return {
      'short': 'Test',
      'long': 'Hey its ok'
    }
  }
}

let test = new Test(process.argv)