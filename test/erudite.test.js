'use strict';

var test = require('tape');
var multiline = require('multiline');
var erudite = require('..');

var m = multiline.stripIndent;

test('parses indented code blocks', function (t) {
  t.plan(1);

  var src = m(function () {/*
    # Indented Example

    Let's try indented code.

        var text = 'Lorem ipsum dolor, sit amet...';

    Now, print it.

        console.log(text);
  */});

  var expected = m(function () {/*
    "use strict";

    var text = "Lorem ipsum dolor, sit amet...";

    console.log(text);
  */});

  t.equals(erudite.parse(src).toString(), expected);
});

test('parses fenced code blocks', function (t) {
  t.plan(1);

  var src = m(function () {/*
    # Fenced Example

    Let's try fenced code.

    ```js
    function add (a, b) {
      return a + b;
    }
    ```

    Now, print it.

    ```js
    console.log(add(2, 3));
    ```
  */});

  var expected = m(function () {/*
    "use strict";

    function add(a, b) {
      return a + b;
    }

    console.log(add(2, 3));
  */});

  t.equals(erudite.parse(src).toString(), expected);
});

test('parses mixed code blocks', function (t) {
  t.plan(1);

  var src = m(function () {/*
    # Literate JavaScript

    I've been inspired by [Literate CoffeeScript](http://coffeescript.org/#literate) to create a literate JavaScript parser. I like the idea of writing [Markdown](http://daringfireball.net/projects/markdown), but having executable JavaScript code blocks.

        'use strict';
        var fs = require('fs');
        var stream = require('stream');

    Let's read this file, and transform all characters to uppercase.

    ```js
    var readStream = fs.createReadStream(__filename);
    var upcaseStream = new stream.Transform();
    upcaseStream._transform = function (chunk, encoding, done) {
      this.push(chunk.toString().toUpperCase());
      done();
    };
    var stdoutStream = new stream.Writable();
    stdoutStream._write = function (chunk, encoding, done) {
      console.log(chunk.toString());
      done();
    };
    ```

    Take it to the bank.

        readStream
          .pipe(upcaseStream)
          .pipe(stdoutStream);
  */});

  var expected = m(function () {/*
    "use strict";

    var fs = require("fs");
    var stream = require("stream");

    var readStream = fs.createReadStream(__filename);
    var upcaseStream = new stream.Transform();
    upcaseStream._transform = function (chunk, encoding, done) {
      this.push(chunk.toString().toUpperCase());
      done();
    };
    var stdoutStream = new stream.Writable();
    stdoutStream._write = function (chunk, encoding, done) {
      console.log(chunk.toString());
      done();
    };

    readStream.pipe(upcaseStream).pipe(stdoutStream);
  */});

  t.equals(erudite.parse(src).toString(), expected);
});

test('parses jsx code blocks', function (t) {
  t.plan(1);

  var src = m(function () {/*
    # Erudite and JSX

    [React][] is a library by Facebook for building UIs. It features an optional
    HTML-like syntax called **JSX**:

        var React = require("react");

    Then, declare a _component_:

        var Panel = module.exports = React.createClass({
          render() {
            return (
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title">{this.props.title}</h3>
                </div>
                <div className="panel-body">
                  {this.props.children}
                </div>
              </div>
            )
          }
        });

    **That's it!** It's just that simple.

    [react]: http://facebook.github.io/react
  */});

  var expected = m(function () {/*
    "use strict";

    var React = require("react");

    var Panel = module.exports = React.createClass({
      displayName: "exports",

      render: function render() {
        return React.createElement(
          "div",
          { className: "panel panel-default" },
          React.createElement(
            "div",
            { className: "panel-heading" },
            React.createElement(
              "h3",
              { className: "panel-title" },
              this.props.title
            )
          ),
          React.createElement(
            "div",
            { className: "panel-body" },
            this.props.children
          )
        );
      }
    });
  */});

  t.equals(erudite.parse(src).toString(), expected);
});

test('executes parsed code', function (t) {
  t.plan(2);

  var src = m(function () {/*
    # Hello World

    ```js
    var inspect = require('util').inspect;
    var foo = "bar";
    baz = foo.toUpperCase();
    inspect(baz);
    ```
  */});
  var ctx = erudite(src);
  t.equals(ctx.foo, 'bar');
  t.equals(ctx.baz, 'BAR');
});

test('parses ES6 syntax', function (t) {
  t.plan(2);

  var src = m(function () {/*
    # ES6

    [Babel](babeljs.io) is a new JavaScript transpiler, featuring ES6/JSX support.

        class Die {
          constructor(n = 6) {
            this._sides = n;
          }

          roll() {
            return Math.random * this._sides + 1;
          }

          toString () {
            return `[Die sides:${this._sides}]`;
          }
        }

    Let's see the `Die` class in action:

        var die = new Die(12);
        var description = die.toString();
        die.roll();
  */});

  var ctx = erudite(src);
  t.ok(ctx.die instanceof ctx.Die);
  t.equals(ctx.description, '[Die sides:12]');
});
