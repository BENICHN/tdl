import { useState } from 'react'
import Icon from '@mdi/react';
import { mdiFileOutline, mdiFolderOutline, mdiChevronRight,
  mdiFileVideoOutline, mdiFileImageOutline, mdiFileDocumentOutline, mdiFilePdfOutline, mdiFileTableOutline, mdiFileMusicOutline, mdiFileCodeOutline, mdiFolderZipOutline, mdiFileWordOutline, mdiFileExcelOutline, mdiFilePowerpointOutline, mdiFileCogOutline } from '@mdi/js';
import { scan, isEmpty, last, intersperse, stringFromSize, fetchtrrpc, toString2 } from '../utils'

function iconFromExtension(ext) {
    switch (ext) {
        case '.doc':
        case '.docx':
        case '.odt':
        case '.pages':
            return mdiFileWordOutline
        
        case 'log':
        case 'rtf':
        case 'tex':
        case 'txt':
            return mdiFileDocumentOutline

        case 'csv':
            return mdiFileTableOutline

        case 'xls':
        case 'xlsx':
        case 'ods':
            return mdiFileExcelOutline

        case 'aif':
        case 'iff':
        case 'm4a':
        case 'mid':
        case 'mp3':
        case 'mp2':
        case 'mpa':
        case 'wma':
        case 'flac':
        case 'aac':
        case 'ogg':
        case 'aa':
        case 'aax':
        case 'act':
        case 'aiff':
        case 'alac':
        case 'amr':
        case 'ape':
        case 'au':
        case 'awb':
        case 'm4b':
        case 'm4p':
        case 'mpc':
        case 'oga':
        case 'mogg':
        case 'opus':
        case 'ra':
        case 'tta':
        case 'cda':
        case 'wv':
            return mdiFileMusicOutline

        case '3g2':
        case '3gp':
        case 'asf':
        case 'avi':
        case 'flv':
        case 'mov':
        case 'mp4':
        case 'mkv':
        case 'ts':
        case 'mpg':
        case 'rm':
        case 'srt':
        case 'vob':
        case 'wmv':
        case 'h264':
        case 'h265':
        case 'webm':
        case 'ogv':
        case 'm4v':
        case 'svi':
            return mdiFileVideoOutline

        case 'bmp':
        case 'dds':
        case 'gif':
        case 'heic':
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'apng':
        case 'tga':
        case 'thm':
        case 'tif':
        case 'tiff':
        case 'yuv':
        case 'webp':
        case 'bpg':
        case 'ico':
        case 'icns':
            return mdiFileImageOutline

        case 'pdf':
        case 'ps':
        case 'djvu':
            return mdiFilePdfOutline

        case 'ppt':
        case 'pptx':
        case 'odp':
            return mdiFilePowerpointOutline

        case '7z':
        case 'cbr':
        case 'deb':
        case 'pkg':
        case 'rar':
        case 'rpm':
        case 'tar':
        case 'tar.gz':
        case 'zip':
        case 'zipx':
            return mdiFolderZipOutline

        case 'c':
        case 'class':
        case 'cpp':
        case 'cs':
        case 'dtd':
        case 'h':
        case 'hpp':
        case 'java':
        case 'js':
        case 'jsx':
        case 'tsx':
        case 'lua':
        case 'm':
        case 'pl':
        case 'py':
        case 'hs':
        case 'fs':
        case 'fsx':
        case 'sh':
        case 'swift':
        case 'vb':
        case 'html':
        case 'css':
            return mdiFileCodeOutline

        case 'exe':
        case 'o':
        case 'a':
        case 'bin':
            return mdiFileCogOutline
    
        default:
            return mdiFileOutline
    }
}

function findPath(data, path) {
    let curdir = data
    for (let i = 0; i < path.length; i++) {
        const dir = path[i]
        curdir = curdir.find(d => d.tag === 'Directory' && d.dirname === dir).dircontent
    }
    return curdir
}

const funcOfDF = f => df => {
    switch (df.tag) {
        case "File":
            return f(df)
        case "Directory":
            return df.dircontent.map(funcOfDF (f)).reduce((a, v) => a + v, 0)
        default:
            return ''
    }
}

function isChecked(df) {
    switch (df.tag) {
        case "File":
            return df.filedetails.wanted
        case "Directory":
            return df.dircontent.map(isChecked).reduce((a, v) => a === null ? null : v === true ? true : a === true ? null : false, false)
        default:
            return ''
    }
}

function getDFids(df) {
    switch (df.tag) {
        case "File":
            return [df.filedetails.id]
        case "Directory":
            return df.dircontent.map(getDFids).reduce((a, v) => a.concat(v), [])
        default:
            return ''
    }
}

function unwantDF(id, df, v) {
    const ids = getDFids(df)
    console.log(ids)
    return fetchtrrpc({
        method: 'torrent-set',
        arguments: {
            ids: [ id ],
            "files-unwanted": v ? null : ids,
            "files-wanted": v ? ids : null,
        }
    })
}

const sizeOfDF = funcOfDF (df => df.filedetails.length ?? df.filedetails)
const haveOfDF = funcOfDF (df => df.filedetails.bytesCompleted)

export default function FileExplorer(props) {
    const [path, setPath] = useState([])
    return <div className='fexpl h100 fc'>
        <div className='fexplnav sbh'>
            <div className='fr'>
                {intersperse(<Icon className='fexplchevron' path={mdiChevronRight} />, scan((acc, v) => [...acc, v], [], path).map((v, i) => <div className='opbutton fexplpathbutton' ref={i === path.length ? (e => e?.scrollIntoView()) : null} onClick={() => setPath(v)}>
                    {isEmpty(v) ? 'Racine' : last(v)}
                </div>))}
            </div>
        </div>
        <ul className='f1'>
            {findPath(props.data, path).map((item, index) => {
                const chk = isChecked(item)
                const hv = haveOfDF(item)
                const sz = sizeOfDF(item)
                return <li key={item.tag === 'Directory' ? item.dirname : item.filename}>
                    <div className={'fr fexpllistf ac ' + (index % 2 === 0 ? 'fff' : 'ff5')}>
                        {props.isTR && <input type='checkbox' checked={chk} ref={cb => {if (cb) cb.indeterminate = chk === null}} onChange={async ({ target }) => await unwantDF(props.id, item, target.checked)} />}
                        {item.tag === 'Directory' ?
                            <div className='f1 oh fr opbutton ac' onClick={() => setPath([...path, item.dirname])} ><Icon className='fexpllisticon' path={mdiFolderOutline} /><div className='f1 oh fexplname' >{item.dirname}</div></div>
                            : <div className='f1 oh fr ac' ><Icon className='fexpllisticon' path={iconFromExtension(last(item.filename.split('.')).toLowerCase())} /><div className='f1 oh fexplname' >{item.filename}</div></div>}
                        <div>{props.isTR ? stringFromSize(hv) + '/' : ''}{stringFromSize(sz)}{props.isTR ? ' (' + toString2(hv/sz * 100) + '%)' : ''}</div></div>
                </li>
            })}
        </ul>
    </div >
}