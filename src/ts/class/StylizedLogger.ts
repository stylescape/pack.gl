// class/StylizedLogger.ts

// Copyright 2024 Scape Agency BV

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// ============================================================================
// Import
// ============================================================================


// ============================================================================
// Classes
// ============================================================================

class StylizedLogger {

    private styles = {
        reset: "\x1b[0m",
        fg: {
            black: "\x1b[30m",
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m",
            white: "\x1b[37m"
        },
        bg: {
            black: "\x1b[40m",
            red: "\x1b[41m",
            green: "\x1b[42m",
            yellow: "\x1b[43m",
            blue: "\x1b[44m",
            magenta: "\x1b[45m",
            cyan: "\x1b[46m",
            white: "\x1b[47m"
        }
    };

    log(message: string, fgColor: keyof typeof this.styles.fg, bgColor: keyof typeof this.styles.bg = 'black'): void {
        console.log(`${this.styles.fg[fgColor]}${this.styles.bg[bgColor]}%s${this.styles.reset}`, message);
    }

    header(message: string): void {
        this.log(message, 'white', 'blue');
    }

    error(message: string): void {
        this.log(message, 'white', 'red');
    }

    body(message: string): void {
        this.log(message, 'black', 'white');
    }
}


// ============================================================================
// Export
// ============================================================================

export default StylizedLogger;
