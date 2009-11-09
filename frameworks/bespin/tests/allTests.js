/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and
 * limitations under the License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * ***** END LICENSE BLOCK ***** */

var qunit = require("qunit");

qunit.init();

console.log("Starting the test suite");

qunit.test("Sanity", function() {
    qunit.ok(true, "Sanity is not looking good.");
});

// command-line only tests
if (typeof document == "undefined") {
    // trick the static dependency resolver. This
    // keeps the module from being sent to the browser,
    // but still works on the command line.
    var r = require;
    r("bespin/builder/tests/allTests");
}

qunit.start();