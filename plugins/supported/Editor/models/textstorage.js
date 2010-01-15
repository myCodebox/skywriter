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
var MultiDelegateSupport =
    require('mixins/multidelegate').MultiDelegateSupport;
var TextBuffer = require('mixins/textbuffer').TextBuffer;

exports.TextStorage = SC.Object.extend(MultiDelegateSupport, TextBuffer, {
    /**
     * @property{Array<String>}
     *
     * The list of lines, stored as an array of strings. Read-only.
     */
    lines: null,

    value: function(key, value) {
        if (value !== undefined) {
            this.replaceCharacters(this.range(), value);
        }
        return this.get('lines').join("\n");
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
            return this.range().end;
        }

        return {
            row:    row,
            column: Math.max(0, Math.min(position.column, lines[row].length))
        };
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
     * Returns the span of the entire text content.
     */
    range: function() {
        var lines = this.get('lines');
        return {
            start:  { row: 0, column: 0 },
            end:    {
                row:    lines.length - 1,
                column: lines[lines.length - 1].length
            }
        };
    },

    /**
     * Replaces the characters within the supplied range with the given string.
     */
    replaceCharacters: function(oldRange, characters) {
        var addedLines = characters.split("\n");
        var addedLineCount = addedLines.length;

        var newRange = this.resultingRangeForReplacement(oldRange, addedLines);

        var oldStart = oldRange.start, oldEnd = oldRange.end;
        var oldStartRow = oldStart.row, oldEndRow = oldEnd.row;
        var oldStartColumn = oldStart.column;

        var lines = this.get('lines');
        addedLines[0] = lines[oldStartRow].substring(0, oldStartColumn) +
            addedLines[0];
        addedLines[addedLineCount - 1] +=
            lines[oldEndRow].substring(oldEnd.column);

        lines.replace(oldStartRow, oldEndRow - oldStartRow + 1, addedLines);

        this.notifyDelegates('textStorageEdited', oldRange, newRange);
    }
});
