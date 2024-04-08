const path = require( "path" )
const { readFile, readFileSync, readdir, readdirSync, stat, statSync } = require( "fs" )

/** @param {string} pathArg @param {RegExp=} filter  */
function readFileRecursiveSync( pathArg, filter ) {
    if ( statSync( pathArg ).isFile() ) return [{ path: pathArg, content: readFileSync( pathArg ).toString() }]
    if ( !statSync( pathArg ).isDirectory() ) return []

    function getFiles( pathArg ) {
        return readdirSync( pathArg )
            .map( p => path.join( pathArg, p ) )
            .filter( p => statSync( p ).isFile() && ( filter ? filter.test( p ) : true ) )
    }
    function getDirs( pathArg ) {
        return readdirSync( pathArg )
            .map( p => path.join( pathArg, p ) )
            .filter( p => statSync( p ).isDirectory() )
    }

    const dirs = getDirs( pathArg )
    const files = getFiles( pathArg )

    while ( dirs.length ) {
        const dir = dirs.shift()
        const dirFiles = getFiles( dir )
        files.push( ...dirFiles )
    }

    const output = files.map( p => ( {
        path: p,
        content: readFileSync( p ).toString()
    } ) )

    return output
}

module.exports = {
    readFileRecursiveSync
}