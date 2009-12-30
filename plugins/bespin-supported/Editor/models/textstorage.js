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

exports.TextStorage = SC.Object.extend({
    /**
     * A list of delegates objects. All objects in this array receive
     * textStorageEdited() messages.
     */
    delegates: null,

    /**
     * @property{Array<String>}
     *
     * The list of lines, stored as an array of strings. Read-only.
     */
    lines: null,

    value: function(key, value) {
        var lines = this.get('lines');
        if (value !== undefined) {
            var rowCount = lines.length;
            this.replaceCharacters({
                start:  { row: 0, column: 0 },
                end:    {
                    row:    rowCount - 1,
                    column: lines[rowCount - 1].length
                }
            }, value);
        }

        return lines.join("\n");
    }.property('lines.[]'),

    /**
     * Returns the position of the nearest character to the given position,
     * according to the selection rules.
     */
    clampPosition: function(position) {
        var lines = this.get('lines');
        var row = position.row;
        if (row < 0) {
            return { row: 0, column: 0 };
        } else if (row >= lines.length) {
            var lastRow = lines.length - 1;
            return { row: lastRow, column: lines[lastRow].length };
        }

        return {
            row:    row,
            column: Math.max(0, Math.min(position.column, lines[row].length))
        };
    },

    /**
     * Deletes characters from the given range.
     */
    deleteCharacters: function(range) {
        this.replaceCharacters(range, "");
    },

    /**
     * Returns the result of displacing the given position by one character
     * forward (if @count is 1) or backward (if @count is -1).
     */
    displacePosition: function(position, count) {
        var row = position.row, column = position.column;
        switch (count) {
        case -1:
            if (row === 0 && column == 0) {
                return position;
            }
            return column === 0 ?
                { row: row - 1, column: this.get('lines')[row - 1].length   } :
                { row: row,     column: column - 1                          };
        case 1:
            var lines = this.get('lines');
            var lineCount = lines.length, rowLength = lines[row].length;
            if (row === lineCount - 1 && column === rowLength) {
                return position;
            }
            return column === rowLength ?
                { row: row + 1, column: 0           } :
                { row: row,     column: column + 1  };
        default:
            throw "TextStorage.displacePosition(): count must be 1 or -1";
        }
    },

    init: function() {
        this.superclass();

        this.set('delegates', []);
        this.set('lines', [ "" ]);
    },

    /**
     * Inserts the given characters at the supplied position.
     */
    insertCharacters: function(position, characters) {
        this.replaceCharacters({ start: position, end: position }, characters);
    },

    /**
     * Replaces the characters within the supplied range with the given string.
     */
    replaceCharacters: function(range, characters) {
        var addedLines = characters.split("\n");
        var lines = this.get('lines');
        var startRow = range.start.row, endRow = range.end.row;
        addedLines[0] = lines[startRow].substring(0, range.start.column) +
            addedLines[0];
        addedLines[addedLines.length - 1] +=
            lines[endRow].substring(range.end.column);

        lines.replace(startRow, endRow - startRow + 1, addedLines);

        var thisTextStorage = this;
        this.get('delegates').forEach(function(delegate) {
            delegate.textStorageEdited(thisTextStorage, range, characters);
        });
    }
});
