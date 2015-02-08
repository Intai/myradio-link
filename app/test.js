class Greeter {
  constructor(message) {
    this.message = message;
  }

  greet() {
    alert(this.message);
  }
}

alert('here');
var name = 'world';
var greeting = `hello ${name}`;
var greeter = new Greeter('Hello, world!');
greeter.greet();
