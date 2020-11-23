#/usr/bin/env zsh

script_dir=${0:h}

# Paths are relative to the `functions` directory
schemaFile="../databaseSchema.bolt"

databaseRulesJsonOutput="../database.rules.json"
typescriptSchemaOutput="./apiContract/database/Schema.ts"

typescriptSchemaHeader='/*
 * THIS IS AN AUTO-GENERATED FILE – DO NOT EDIT BY HAND!
 *
 * To update the schema types, modify `databaseSchema.bolt` and then run `yarn bolt`
 * to regenerate this file.
 */
'

# Clean up the old files to be extra sure
rm "$databaseRulesJsonOutput" 2>/dev/null
rm "$typescriptSchemaOutput" 2>/dev/null


# Compile the JSON database rules schema
firebase-bolt < "$schemaFile" > "$databaseRulesJsonOutput"


# Compile the Typescript typedefs
echo "$typescriptSchemaHeader" > "$typescriptSchemaOutput"
firebase-bolt-compiler < "$schemaFile" > "$typescriptSchemaOutput"
