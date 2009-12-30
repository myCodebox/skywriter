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

var SC = require('sproutcore/runtime').SC;
var t = require('PluginDev');
var TextStorage = require('models/textstorage').TextStorage;

exports.testCharacterMutators = function() {
    var storage = TextStorage.create({});
    storage.insertCharacters({ row: 0, column: 0 }, "foo\nbar\nbaz\n");
    t.equal(storage.get('value'), "foo\nbar\nbaz\n",
        "characters inserted into an empty text storage object and the " +
            "original characters");
    var lines = storage.lines;
    t.equal(lines[0].length, 3, "length of first row and 3");
    t.equal(lines[1].length, 3, "length of second row and 3");
    t.equal(lines[2].length, 3, "length of third row and 3");
    t.equal(lines[3].length, 0, "length of last row and 0");

    storage.deleteCharacters({
        start: {
            row:    1,
            column: 1
        },
        end: {
            row:    2,
            column: 2
        }
    });
    t.equal(storage.get('value'), "foo\nbz\n",
        "the result of deleting characters from a text storage object and " +
            "the expected string");
    t.equal(lines[0].length, 3, "length of first row and 3");
    t.equal(lines[1].length, 2, "length of second row and 2");
    t.equal(lines[2].length, 0, "length of last row and 0");

    storage.replaceCharacters({
        start: {
            row:    0,
            column: 2
        },
        end: {
            row:    1,
            column: 1
        }
    }, "obarba");
    t.equal(storage.get('value'), "foobarbaz\n",
        "the result of replacing characters in a text storage object and " +
            "the expected string");
    t.equal(lines[0].length, 9, "length of first row and 9");
};

exports.testClampPosition = function() {
    var storage = TextStorage.create({});
    storage.insertCharacters({ row: 0, column: 0 }, "foo\nbar\nbaz\n");

    t.deepEqual(storage.clampPosition({ row: 1, column: 1 }),
        { row: 1, column: 1 },
        "(1,1) clamped to the text boundaries and (1,1)");

    t.deepEqual(storage.clampPosition({ row: -1, column: -1 }),
        { row: 0, column: 0 },
        "(-1,-1) clamped to the text boundaries and (0,0)");
    t.deepEqual(storage.clampPosition({ row: -1, column: 1 }),
        { row: 0, column: 0 },
        "(-1,1) clamped to the text boundaries and (0,0)");
    t.deepEqual(storage.clampPosition({ row: -1, column: 4 }),
        { row: 0, column: 0 },
        "(-1,4) clamped to the text boundaries and (0,0)");

    t.deepEqual(storage.clampPosition({ row: 1, column: -1 }),
        { row: 1, column: 0 },
        "(1,-1) clamped to the text boundaries and (1,0)");
    t.deepEqual(storage.clampPosition({ row: 1, column: 1 }),
        { row: 1, column: 1 },
        "(1,1) clamped to the text boundaries and (1,1)");
    t.deepEqual(storage.clampPosition({ row: 1, column: 4 }),
        { row: 1, column: 3 },
        "(1,4) clamped to the text boundaries and (1,3)");

    t.deepEqual(storage.clampPosition({ row: 4, column: -1 }),
        { row: 3, column: 0 },
        "(4,-1) clamped to the text boundaries and (3,0)");
    t.deepEqual(storage.clampPosition({ row: 4, column: 2 }),
        { row: 3, column: 0 },
        "(4,2) clamped to the text boundaries and (3,0)");
    t.deepEqual(storage.clampPosition({ row: 4, column: 4 }),
        { row: 3, column: 0 },
        "(4,4) clamped to the text boundaries and (3,0)");
};

exports.testDisplacePosition = function() {
    var storage = TextStorage.create({});
    storage.insertCharacters({ row: 0, column: 0 }, "foo\nbar\nbaz\n");

    t.deepEqual(storage.displacePosition({ row: 1, column: 1 }, -1),
        { row: 1, column: 0 }, "(1,1) displaced by -1 and (1,0)");
    t.deepEqual(storage.displacePosition({ row: 1, column: 0 }, -1),
        { row: 0, column: 3 }, "(1,0) displaced by -1 and (0,3)");
    t.deepEqual(storage.displacePosition({ row: 0, column: 0 }, -1),
        { row: 0, column: 0 }, "(0,0) displaced by -1 and (0,0)");

    t.deepEqual(storage.displacePosition({ row: 1, column: 1 }, 1),
        { row: 1, column: 2 }, "(1,1) displaced by 1 and (1,2)");
    t.deepEqual(storage.displacePosition({ row: 1, column: 3 }, 1),
        { row: 2, column: 0 }, "(1,3) displaced by 1 and (2,0)");
    t.deepEqual(storage.displacePosition({ row: 3, column: 0 }, 1),
        { row: 3, column: 0 }, "(3,0) displaced by 1 and (3,0)");
};

exports.testObserving = function() {
    var storage = TextStorage.create({});
    storage.insertCharacters({ row: 0, column: 0 }, "foo\nbar\nbaz\n");

    var delegate = {};
    storage.get('delegates').push(delegate);

    var deletionRange = {
        start: {
            row:    0,
            column: 1
        },
        end: {
            row:    2,
            column: 2
        }
    };

    var called = false;
    delegate.textStorageEdited = function(storage, range, characters) {
        called = true;
        t.deepEqual(range, deletionRange, "range passed in to textStorageEdited " +
            "and the actual range deleted");
        t.equal(characters, "", "replaced characters and the empty string");
    };

    storage.deleteCharacters(deletionRange);
    t.ok(called, "textStorageEdited() was called");
};
