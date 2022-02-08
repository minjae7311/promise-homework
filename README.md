# Promise assignment

javascript Promise 구현 과제 by MINJAE KIM


`Promise` is a pattern that represents the eventual completion (or failure) of an asynchronous operation, and its resulting value. ECMAScript 6 (or ES6) introduces it and is widely used to simplify the workflow. This assignment is to implement `Promise` class with vanillaJavaScript(ES5orES6).YoucouldseeallthespecificationofPromiseh​ ere​,andthe following methods should be implemented.



## methods 

* new Promise(executor)
* Promise.all(iterable) (supposed that iterable is the type of Array<Promise>)
* Promise.resolve(reason)
* Promise.reject(value)
* Promise.prototype.then(func)
* Promise.prototype.catch(func)
* Promise.prototype.finally(func)
