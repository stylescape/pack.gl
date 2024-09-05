// interface/File.ts

// Copyright 2023 Scape Agency BV

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
// Interfaces
// ============================================================================

/**
 * Interface for representing a file within the system.
 * This interface is used to define the structure of file data objects
 * that include both the file path and its source content.
 */
export interface File {

    /**
     * The full path to the file.
     * This should include the complete directory path and the file name with its extension.
     */
    filepath: string;

    /**
     * The source content of the file.
     * This could be any form of text, such as code, configuration, or plain text.
     */
    source: string;

}