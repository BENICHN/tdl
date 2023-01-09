import { useState } from "react"

export function last(a) {
    return a[a.length - 1]
}

export function scan(reducer, init, a) {
    return a.reduce((acc, v) => [...acc, reducer(last(acc), v)], [init])
}

export function intersperse(sep, a) {
    return a.flatMap(v => [sep, v]).slice(1)
}

export function isEmpty(a) {
    return a.length === 0
}

export function fetchjson(url, optns = {}) {
    return fetch(url, optns).then(r => r.json())
}

export const hYGGHost = ''
export var yggConfig = null
export const defaultSQ = { name: '', page: 0, sort: '', order: '' }

export function urlFromSearchQuery(q) {
    return hYGGHost + '/search?do=search&name=' + encodeURIComponent(q.name) + '&page=' + q.page + '&sort=' + q.sort + '&order=' + q.order + '&' + getQueryStringFromFD(q.filter)
}

export function urlFromTorUrlEnd(torurlend) {
    return hYGGHost + torurlend
}

export function getQueryStringFromFD(fd) {
    return new URLSearchParams(fd).toString()
}

export function getQueryString(f) {
    return new URLSearchParams(new FormData(f)).toString()
}

export function toString2(s) {
    return s.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false })
}

export const trRPCAddress = ''
export var xtrsid = ''
// export var trTorrentList = []

export async function fetchtrrpc(body) {
    const r = await fetch(trRPCAddress, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-transmission-session-id': xtrsid
        },
        body: JSON.stringify(body)
    })
    if (r.status === 409) {
        xtrsid = r.headers.get('x-transmission-session-id')
        return await fetchtrrpc(body)
    }
    else return await r.json()
}

export function getTrTL() {
    return fetchtrrpc({
        method: 'torrent-get',
        arguments: {
            fields: [ 'id', 'labels', 'name', 'eta', 'haveValid', 'haveUnchecked', 'isFinished', 'peersConnected', 'percentDone', 'rateDownload', 'rateUpload', 'status', 'totalSize', 'uploadedEver', 'uploadRatio' ]
        }
    }).then(r => r.arguments.torrents.map(t => {return {...t, tid: +t.labels[0], cat: t.labels[1], torurlend: t.labels[2]}}))
}

function* range(start, end) {
    for (let i = start; i <= end; i++) {
        yield i;
    }
}

function* drange(end, start) {
    for (let i = end; i >= start; i--) {
        yield i;
    }
}

function byteToArray(byte) {
    return Array.from(drange(7, 0), i => ((byte >> i) & 1) === 1)
}

function piecesToArray(pieces, pieceCount) {
    return [...atob(pieces)].flatMap(c => byteToArray(c.charCodeAt(0))).slice(0, pieceCount)
}

export function useForceUpdate(){
    const [_, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update the state to force render
}

export function getTrTID(id) {
    return fetchtrrpc({
        method: 'torrent-get',
        arguments: {
            ids: [ id ],
            fields: [ 'files', 'pieces', 'pieceCount', 'pieceSize', 'peers', 'priorities', 'wanted', 'trackerStats' ]
        }
    }).then(r => {
        const t = r.arguments.torrents[0]
        if (!t) return undefined
        const pa = piecesToArray(t.pieces, t.pieceCount)
        return {...t, piecesarray: pa, pieceHaveCount: pa.filter(p => p).length, filetree: buildTreeFromFiles(transmissionFilesToTree(t.files, t.wanted, t.priorities))} })
}

export async function addTorrent(tf, paused, files) {
    const r = await fetchtrrpc({
        method: 'torrent-add',
        arguments: {
            filename: hYGGHost + '/dl/' + tf.tid,
            paused: paused,
            'files-wanted': files?.wanted,
            'files-unwamted': files?.unwanted,
            'priority-high': files?.ph,
            'priority-low': files?.pl,
            'priority-normal': files?.pn
        }
    })
    const id = r.arguments['torrent-added']?.id ?? r.arguments['torrent-duplicate']?.id
    await fetchtrrpc({
        method: 'torrent-set',
        arguments: {
            ids: [ id ],
            labels: [ tf.tid.toString(), tf.cat, tf.torurlend ]
        }
    })
    return r
}

export function startTorrent(id) {
    return fetchtrrpc({
        method: 'torrent-start',
        arguments: {
            ids: [ id ]
        }
    })
}

export function stopTorrent(id) {
    return fetchtrrpc({
        method: 'torrent-stop',
        arguments: {
            ids: [ id ]
        }
    })
}

export function tryGetTorrentFromTid(tl, tid) {
    return tl.find(t => t.tid === tid)
}

export function tryGetTorrentFromId(tl, id) {
    return tl.find(t => t.id === id)
}


export function stringFromSize(size) {
    let u = 0
    while (u < 8 && size > 900) { u++; size /= 1024 }
    return toString2(size) + (() => {
        switch (u) {
            case 0:
                return 'o';
            case 1:
                return 'ko';
            case 2:
                return 'Mo';
            case 3:
                return 'Go';
            case 4:
                return 'To';
            case 5:
                return 'Po';
            case 6:
                return 'Eo';
            case 7:
                return 'Zo';
            case 8:
                return 'Yo';
            default:
                return 'err'
        }
    })()
}

export function sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

export function stringFromDate(ts) {
    const now = new Date()
    const date = new Date(ts)
    const day = sameDay(now, date) ? "aujourd'hui" : 'le ' + date.toLocaleDateString()
    return day + ' à ' + date.toLocaleTimeString()
}

export function qr(n, b) {
    const r = n % b
    const q = (n-r)/b
    return [q, r]
}

export function stringFromTime(tms) {
    const [ts, ms] = qr(tms, 1000)
    const [tm, s] = qr(ts, 60)
    const [th, m] = qr(tm, 60)
    const [td, h] = qr(th, 24)
    
    if (tms === 0) return '0s'
    if (ts === 0) return ms + 'ms'
    if (tm === 0) return s + 's' // toString2(ms/1000) + ' s'
    if (th === 0) return m + 'min ' + s + 's'
    if (td === 0) return h + 'h ' + m + 'min ' + s + 's'
    return td + 'jours ' + h + 'h ' + m + 'min ' + s + 's'
}

export default async function init() {
    try { yggConfig = await fetchjson(hYGGHost + '/config') }
    catch (e) { e.message = 'Could not get config from hYGG: \n' + e.message; throw e }
    
    // try { xtrsid = await fetch(trRPCAddress, { method: 'HEAD' }).then(r => r.headers.get('x-transmission-session-id')) }
    // catch (e) { e.message = 'Could not get session id from transmission-rpc: \n' + e.message; throw e }

    // setInterval(async () => {
    //     trTorrentList = await getTrTL()
    // }, 1000);
}

export const FilterFields = {
    KType: {id: 'option_type[]', name: 'Type', options: [
        {id: 1, name: 'Audio + Texte'},
        {id: 2, name: 'Vidéo + Sous-titrage'} ]},
    MFormat: {id: 'option_format[]', name: 'Format', options: [
        {id: 1, name: 'Aac (M4a)'},
        {id: 2, name: 'Ac3'},
        {id: 3, name: 'Aif'},
        {id: 4, name: 'Alac (M4a)'},
        {id: 5, name: 'Bluray Pure Audio'},
        {id: 6, name: 'Dsd'},
        {id: 7, name: 'Dts'},
        {id: 8, name: 'Flac (16 bit)'},
        {id: 9, name: 'Flac (24 bit)'},
        {id: 10, name: "Monkey's Audio"},
        {id: 11, name: 'Mp3'},
        {id: 12, name: 'Mpc'},
        {id: 13, name: 'Ogg'},
        {id: 14, name: 'Samples'},
        {id: 15, name: 'Wav'},
        {id: 16, name: 'Wavpack'},
        {id: 17, name: 'Wma'} ]},
    MQualite: {id: 'option_qualite[]', name: 'Qualité', options: [
        {id: 1, name: 'Bluray Audio'},
        {id: 2, name: 'Cd'},
        {id: 3, name: 'Sacd'},
        {id: 4, name: 'Vinyle'},
        {id: 5, name: 'Web'} ]},
    MType: {id: 'option_type[]', name: 'Type', options: [
        {id: 1, name: 'Album'},
        {id: 2, name: 'Bande originale de film/jeu'},
        {id: 3, name: 'Discographie'},
        {id: 4, name: 'Ep'},
        {id: 5, name: 'Intégrale/Coffret'},
        {id: 6, name: 'Live/Concert'},
        {id: 7, name: 'Mix/Medley'},
        {id: 8, name: 'Piste audio de film'},
        {id: 9, name: 'Radio'} ]},
    MGenre: {id: 'option_genre:multiple[]', name: 'Genre', options: [
        {id: 1, name: 'Acid house'},
        {id: 2, name: 'Acid jazz'},
        {id: 3, name: 'Africaine'},
        {id: 4, name: 'Alternative'},
        {id: 5, name: 'Ambiance'},
        {id: 6, name: 'B.O/OST de film'},
        {id: 7, name: 'B.O/OST de jeu vidéo'},
        {id: 8, name: 'Baroque'},
        {id: 9, name: 'Black metal'},
        {id: 10, name: 'Blues'},
        {id: 11, name: 'Boogie'},
        {id: 12, name: 'Bossa nova'},
        {id: 13, name: 'Britpop'},
        {id: 14, name: 'Celtique'},
        {id: 15, name: 'Chill out'},
        {id: 16, name: 'Cirque'},
        {id: 17, name: 'Classique'},
        {id: 18, name: 'Comédie musicale'},
        {id: 19, name: 'Compilation'},
        {id: 20, name: 'Concerto'},
        {id: 21, name: 'Country'},
        {id: 22, name: 'Créole'},
        {id: 23, name: 'Dance Pop'},
        {id: 24, name: 'Dark Metal'},
        {id: 25, name: 'Death metal'},
        {id: 26, name: 'Disco'},
        {id: 27, name: 'Divers'},
        {id: 28, name: 'Doom Metal'},
        {id: 29, name: 'Drum & bass'},
        {id: 30, name: 'Drumstep'},
        {id: 31, name: 'Dubstep'},
        {id: 32, name: 'East Coast'},
        {id: 33, name: 'Electro'},
        {id: 34, name: 'Electro House'},
        {id: 35, name: 'Electronique'},
        {id: 36, name: 'Enfants'},
        {id: 37, name: 'Eurodance'},
        {id: 38, name: 'Experimental'},
        {id: 39, name: 'Flamenco'},
        {id: 40, name: 'Folk'},
        {id: 41, name: 'Folk Pop'},
        {id: 42, name: 'Free Jazz & Avant-garde'},
        {id: 43, name: 'Funk'},
        {id: 44, name: 'Fusion'},
        {id: 45, name: 'Fusion & Jazz'},
        {id: 46, name: 'G-funk'},
        {id: 47, name: 'Gangsta rap'},
        {id: 48, name: 'Garage'},
        {id: 49, name: 'Gospel'},
        {id: 50, name: 'Gothique'},
        {id: 51, name: 'Grind Core'},
        {id: 52, name: 'Grunge'},
        {id: 53, name: 'Hard Core'},
        {id: 54, name: 'Hard Rock'},
        {id: 55, name: 'Hard Rock Metal'},
        {id: 56, name: 'Heavy Metal'},
        {id: 57, name: 'Hip-Hop'},
        {id: 58, name: 'House'},
        {id: 59, name: 'Humour'},
        {id: 60, name: 'Hymnes'},
        {id: 61, name: 'Indie'},
        {id: 62, name: 'Indie dance'},
        {id: 63, name: 'Industriel'},
        {id: 64, name: 'Instrumental'},
        {id: 65, name: 'Intelligent Dance Music'},
        {id: 66, name: 'Jazz'},
        {id: 67, name: 'Jump Up'},
        {id: 68, name: 'Jungle'},
        {id: 69, name: 'Kiosque'},
        {id: 70, name: 'Latin Jazz'},
        {id: 71, name: 'Lecture'},
        {id: 72, name: 'Liquidstep'},
        {id: 73, name: 'Médiéval'},
        {id: 74, name: 'Metal'},
        {id: 75, name: 'Metal progressif'},
        {id: 76, name: 'Moombahton'},
        {id: 77, name: 'Motown'},
        {id: 78, name: 'Musique sacrée'},
        {id: 79, name: 'Musiques du monde'},
        {id: 80, name: 'Musiques militaires'},
        {id: 81, name: 'New age'},
        {id: 82, name: 'New wave'},
        {id: 83, name: 'Nu Disco'},
        {id: 84, name: 'Old School'},
        {id: 85, name: 'Oldies'},
        {id: 86, name: 'Opéra et voix'},
        {id: 87, name: 'Pièce'},
        {id: 88, name: 'Pop'},
        {id: 89, name: 'Pop Électro'},
        {id: 90, name: 'Pop R&B'},
        {id: 91, name: 'Pop Reggae'},
        {id: 92, name: 'Pop Rock'},
        {id: 93, name: 'Popcorn'},
        {id: 94, name: 'Post-Rock'},
        {id: 95, name: 'Progressive House'},
        {id: 96, name: 'Punk'},
        {id: 97, name: 'R&B'},
        {id: 98, name: 'Radio'},
        {id: 99, name: 'Rag time'},
        {id: 100, name: 'Raggamuffin'},
        {id: 101, name: 'Rap'},
        {id: 102, name: 'Reggae'},
        {id: 103, name: 'Relaxation'},
        {id: 104, name: 'Remix'},
        {id: 105, name: 'Rock'},
        {id: 106, name: 'Rock alternatif'},
        {id: 107, name: 'Rock gothique'},
        {id: 108, name: 'Rock hardcore'},
        {id: 109, name: 'Rock progressif'},
        {id: 110, name: 'Roots'},
        {id: 111, name: 'Rythm and blues'},
        {id: 112, name: 'Salsa'},
        {id: 113, name: 'Samba'},
        {id: 114, name: 'Shoegaze'},
        {id: 115, name: 'Ska'},
        {id: 116, name: 'Soul'},
        {id: 117, name: 'Speed Metal'},
        {id: 118, name: 'Symphonie'},
        {id: 119, name: 'Techno'},
        {id: 120, name: 'Thrash'},
        {id: 121, name: 'Trance'},
        {id: 122, name: 'Trap'},
        {id: 123, name: 'Tribal'},
        {id: 124, name: 'Trip-hop'},
        {id: 125, name: 'Underground'},
        {id: 126, name: 'Variété française'},
        {id: 127, name: 'Variété internationale'},
        {id: 128, name: 'Vocal & Traditionnel'},
        {id: 129, name: 'West Coast'},
        {id: 130, name: 'Zeuhl'},
        {id: 131, name: 'Zouk'} ]},
    PGenre: {id: 'option_genre:multiple[]', name: 'Genre', options: [
        {id: 1, name: 'Humour'},
        {id: 2, name: 'Littéraire'},
        {id: 3, name: 'Loisirs'},
        {id: 4, name: 'Musical'},
        {id: 5, name: 'Politique/Société'},
        {id: 6, name: 'Radio Libre'},
        {id: 7, name: 'Sciences'},
        {id: 8, name: 'Sports'} ]},
        
    ALLangue: {id: 'option_langue[]', name: 'Langue', options: [
        {id: 1, name: 'Anglais'},
        {id: 2, name: 'Français'},
        {id: 3, name: 'Japonais'},
        {id: 4, name: 'Multi (Français inclus)'} ]},
    ALGenre: {id: 'option_genre:multiple[]', name: 'Genre', options: [
        {id: 1, name: 'Actualités'},
        {id: 2, name: 'Animaux'},
        {id: 3, name: 'Art'},
        {id: 4, name: 'Astrologie'},
        {id: 5, name: 'Auto-Moto-Véhicules'},
        {id: 6, name: 'Aventure'},
        {id: 7, name: 'Beauté'},
        {id: 8, name: 'Bien-être'},
        {id: 9, name: 'Biographie'},
        {id: 10, name: 'Bricolage'},
        {id: 11, name: 'Cinéma'},
        {id: 12, name: 'Comédie'},
        {id: 13, name: 'Conte'},
        {id: 14, name: 'Cuisine et Vin'},
        {id: 15, name: 'Décoration'},
        {id: 16, name: 'Dictionnaire'},
        {id: 17, name: 'Droit'},
        {id: 18, name: 'Economie'},
        {id: 19, name: 'Encyclopédies'},
        {id: 20, name: 'Esotérisme'},
        {id: 21, name: 'Fantastique'},
        {id: 22, name: 'Fantasy'},
        {id: 23, name: 'Guerre'},
        {id: 24, name: 'Heroic Fantasy'},
        {id: 25, name: 'Histoire'},
        {id: 26, name: 'Humour'},
        {id: 27, name: 'Informatique'},
        {id: 28, name: 'Internet'},
        {id: 29, name: 'Jardinage'},
        {id: 30, name: 'Jeunesse'},
        {id: 31, name: 'Jeux vidéo'},
        {id: 32, name: 'Journalisme'},
        {id: 33, name: 'Linguistique'},
        {id: 34, name: 'Littérature'},
        {id: 35, name: 'Loisir'},
        {id: 36, name: 'Manuel'},
        {id: 37, name: 'Médecine'},
        {id: 38, name: 'Musique'},
        {id: 39, name: 'Nature'},
        {id: 40, name: 'Nouvelles'},
        {id: 41, name: 'Paranormal'},
        {id: 42, name: 'Parascolaire'},
        {id: 43, name: 'Partitions'},
        {id: 44, name: 'Philosophie'},
        {id: 45, name: 'Photos'},
        {id: 46, name: 'Poésie'},
        {id: 47, name: 'Polar'},
        {id: 48, name: 'Policier'},
        {id: 49, name: 'Politique'},
        {id: 50, name: 'Professionnel'},
        {id: 51, name: 'Religion'},
        {id: 52, name: 'Roman'},
        {id: 53, name: 'Santé'},
        {id: 54, name: 'Science'},
        {id: 55, name: 'Science humaine'},
        {id: 56, name: 'Science-fiction'},
        {id: 57, name: 'Scolaire'},
        {id: 58, name: 'Société'},
        {id: 59, name: 'Spiritualité'},
        {id: 60, name: 'Sport'},
        {id: 61, name: 'Suspense'},
        {id: 62, name: 'Technique'},
        {id: 63, name: 'Terreur'},
        {id: 64, name: 'Théâtre'},
        {id: 65, name: 'Thriller'},
        {id: 66, name: 'Tourisme'},
        {id: 67, name: 'Vie pratique'},
        {id: 68, name: 'Voyage'} ]},
    BDFormat: {id: 'option_format[]', name: 'Format', options: [
        {id: 1, name: 'Azw'},
        {id: 2, name: 'Cb7'},
        {id: 3, name: 'Cba'},
        {id: 4, name: 'Cbr'},
        {id: 5, name: 'Cbt'},
        {id: 6, name: 'Cbz'},
        {id: 7, name: 'Djvu'},
        {id: 8, name: 'Doc'},
        {id: 9, name: 'ePub'},
        {id: 10, name: 'Jpg'},
        {id: 11, name: 'Mobi'},
        {id: 12, name: 'Pdf'},
        {id: 13, name: 'Png'},
        {id: 14, name: 'Prc'} ]},
    ESysteme: {id: 'option_systeme[]', name: 'Systeme', options: [
        {id: 1, name: 'Amstrad CPC'},
        {id: 2, name: 'Amstrad GX-4000'},
        {id: 3, name: 'Amstrad PCW'},
        {id: 4, name: 'Apple I'},
        {id: 5, name: 'Apple II'},
        {id: 6, name: 'Apple III'},
        {id: 7, name: 'Apple Macintosh'},
        {id: 8, name: 'Apple PowerMac'},
        {id: 9, name: 'Atari 2600'},
        {id: 10, name: 'Atari 7800'},
        {id: 11, name: 'Atari Falcon'},
        {id: 12, name: 'Atari Jaguar'},
        {id: 13, name: 'Atari Jaguar II'},
        {id: 14, name: 'Atari Lynx'},
        {id: 15, name: 'Atari Lynx II'},
        {id: 16, name: 'Atari ST'},
        {id: 17, name: 'Atari TT'},
        {id: 18, name: 'Autres'},
        {id: 19, name: 'Coleco Arcade'},
        {id: 20, name: 'Coleco Colecovision'},
        {id: 21, name: 'Coleco Gemini'},
        {id: 22, name: 'Coleco PlayPal'},
        {id: 23, name: 'Coleco Quiz Wiz'},
        {id: 24, name: 'Colecovision Adam'},
        {id: 25, name: 'Commodore 128'},
        {id: 26, name: 'Commodore 64'},
        {id: 27, name: 'Commodore Amiga'},
        {id: 28, name: 'Commodore Amiga CD32'},
        {id: 29, name: 'Commodore Amiga CDTV'},
        {id: 30, name: 'Commodore C64'},
        {id: 31, name: 'GamePark GP2X'},
        {id: 32, name: 'GamePark GP32'},
        {id: 33, name: 'GamePark GPI'},
        {id: 34, name: 'GamePark XGP'},
        {id: 35, name: 'Magnavox/Philips CD-i'},
        {id: 36, name: 'Magnavox/Philips Videopac'},
        {id: 37, name: 'Milton Bradley Microvision'},
        {id: 38, name: 'Milton Bradley Vectrex'},
        {id: 39, name: 'MSX MSX'},
        {id: 40, name: 'Multiple Machines'},
        {id: 41, name: 'NEC CoreGrafX'},
        {id: 42, name: 'NEC PC-Engine'},
        {id: 43, name: 'NEC PC-FX'},
        {id: 44, name: 'NEC SuperGrafX'},
        {id: 45, name: 'NEC TurboGrafx'},
        {id: 46, name: 'Nintendo Game Boy'},
        {id: 47, name: 'Nintendo Game Boy Advance'},
        {id: 48, name: 'Nintendo GameCube'},
        {id: 49, name: 'Nintendo NES'},
        {id: 50, name: 'Nintendo Nintendo 64'},
        {id: 51, name: 'Nintendo Super Nintendo'},
        {id: 52, name: 'Nintendo Virtual Boy'},
        {id: 53, name: 'Nokia N-Gage'},
        {id: 54, name: 'Nokia N-Gage QD'},
        {id: 55, name: 'Oric Atmos'},
        {id: 56, name: 'Oric Oric'},
        {id: 57, name: 'Origin 2000'},
        {id: 58, name: 'Sega Dreamcast'},
        {id: 59, name: 'Sega Game Gear'},
        {id: 60, name: 'Sega Master System'},
        {id: 61, name: 'Sega Megadrive'},
        {id: 62, name: 'Sega Saturn'},
        {id: 63, name: 'Sinclair ZX Spectrum'},
        {id: 64, name: 'Sinclair ZX80'},
        {id: 65, name: 'Sinclair ZX81'},
        {id: 66, name: 'SNK Neo-Geo'},
        {id: 67, name: 'SNK Neo-Geo Pocket'},
        {id: 68, name: 'Sony PlayStation'},
        {id: 69, name: 'The DO Company DO'},
        {id: 70, name: 'Thomson MO5'},
        {id: 71, name: 'Thomson TO16'},
        {id: 72, name: 'Thomson TO7'},
        {id: 73, name: 'Thomson TO8'},
        {id: 74, name: 'Thomson TO9'},
        {id: 75, name: 'VTech V.Smile'},
        {id: 76, name: 'VTech V.Smile Pocket'} ]},
    VGGenre: {id: 'option_genre:multiple[]', name: 'Genre', options: [
        {id: 1, name: 'Action'},
        {id: 2, name: 'Aventure'},
        {id: 3, name: "Beat'em all"},
        {id: 4, name: 'City Builder'},
        {id: 5, name: 'Combat'},
        {id: 6, name: 'Course'},
        {id: 7, name: 'Crack'},
        {id: 8, name: 'DLC'},
        {id: 9, name: 'Educatif'},
        {id: 10, name: 'Flipper'},
        {id: 11, name: 'FPS'},
        {id: 12, name: 'Gestion'},
        {id: 13, name: "hack'n slash"},
        {id: 14, name: 'Infiltration'},
        {id: 15, name: 'Jeu de Rôle'},
        {id: 16, name: 'Ludo-Educatif'},
        {id: 17, name: 'MMO'},
        {id: 18, name: 'Objets cachés'},
        {id: 19, name: 'Party Game'},
        {id: 20, name: 'Plates-formes'},
        {id: 21, name: "Point'n'Click"},
        {id: 22, name: 'Puzzle-Game'},
        {id: 23, name: 'Réflexion'},
        {id: 24, name: 'Roguelike'},
        {id: 25, name: 'Rythme'},
        {id: 26, name: "Shoot'em up"},
        {id: 27, name: 'Simulation'},
        {id: 28, name: 'Sport'},
        {id: 29, name: 'Stratégie'},
        {id: 30, name: 'Survival-Horror'},
        {id: 31, name: 'Tactique'},
        {id: 32, name: 'Tower Defense'},
        {id: 33, name: 'TPS'},
        {id: 34, name: 'Update'},
        {id: 35, name: 'Visual Novel'},
        {id: 36, name: 'Wargame'} ]},
    VGSysteme: {id: 'option_systeme[]', name: 'Système', options: [
        {id: 1, name: 'Androïd'},
        {id: 2, name: 'Bada'},
        {id: 3, name: 'iOS'},
        {id: 4, name: 'MeeGo'},
        {id: 5, name: 'RIM'},
        {id: 6, name: 'Symbian'},
        {id: 7, name: 'WebOS'},
        {id: 8, name: 'Windows Mobile'},
        {id: 9, name: 'Windows RT'} ]},
    VGMConsole: {id: 'option_console[]', name: 'Console', options: [
        {id: 1, name: 'Xbox'},
        {id: 2, name: 'Xbox 360'},
        {id: 3, name: 'Xbox One'} ]},
    VGNConsole: {id: 'option_console[]', name: 'Console', options: [
        {id: 1, name: '3Ds'},
        {id: 2, name: 'Ds'},
        {id: 3, name: 'Gamecube'},
        {id: 4, name: 'Wii'},
        {id: 5, name: 'WiiU'} ]},
    VGSConsole: {id: 'option_console[]', name: 'Console', options: [
        {id: 1, name: 'Playstation'},
        {id: 2, name: 'Playstation2'},
        {id: 3, name: 'Playstation3'},
        {id: 4, name: 'Playstation4'},
        {id: 5, name: 'Psp'},
        {id: 6, name: 'Vita'} ]},
    MAPSysteme: {id: 'option_systeme[]', name: 'Système', options: [
        {id: 1, name: 'Garmin'},
        {id: 2, name: 'Mio'},
        {id: 3, name: 'Navigon'},
        {id: 4, name: 'Navteq'},
        {id: 5, name: 'Tomtom'} ]},
    PGGenre: {id: 'option_genre:multiple[]', name: 'Genre', options: [
        {id: 1, name: 'Accessibilité'},
        {id: 2, name: 'Administration'},
        {id: 3, name: 'Agenda'},
        {id: 4, name: 'Album et visionneuse'},
        {id: 5, name: 'Animation 2D et 3D'},
        {id: 6, name: 'Animaux'},
        {id: 7, name: 'Anonymat'},
        {id: 8, name: 'Anti-spam'},
        {id: 9, name: 'Anti-spyware'},
        {id: 10, name: 'Anti-trojan'},
        {id: 11, name: 'Antivirus'},
        {id: 12, name: 'Architecture'},
        {id: 13, name: 'Aspiration de site'},
        {id: 14, name: 'Astrologie et voyance'},
        {id: 15, name: 'Astronomie et espace'},
        {id: 16, name: 'Audio'},
        {id: 17, name: 'Automobile'},
        {id: 18, name: 'Bricolage'},
        {id: 19, name: 'Bureautique'},
        {id: 20, name: 'CAO et PAO'},
        {id: 21, name: 'Client FTP'},
        {id: 22, name: 'Codec'},
        {id: 23, name: 'Commerce électronique'},
        {id: 24, name: 'Communauté'},
        {id: 25, name: 'Communication'},
        {id: 26, name: 'Compression'},
        {id: 27, name: 'Comptabilité'},
        {id: 28, name: 'Contrôle parental'},
        {id: 29, name: 'Courrier'},
        {id: 30, name: 'Crack'},
        {id: 31, name: 'Cryptage et sécurité'},
        {id: 32, name: 'Cuisine'},
        {id: 33, name: 'Développement'},
        {id: 34, name: 'Développement WEB'},
        {id: 35, name: 'Editeur de site'},
        {id: 36, name: 'Edition multimédia'},
        {id: 37, name: 'Education et scolarité'},
        {id: 38, name: 'Electronique'},
        {id: 39, name: 'Firewall'},
        {id: 40, name: 'Firmware'},
        {id: 41, name: 'Généalogie'},
        {id: 42, name: 'Géographie'},
        {id: 43, name: 'Gestionnaire de fichiers'},
        {id: 44, name: 'Gestionnaire de sites'},
        {id: 45, name: 'Graphisme'},
        {id: 46, name: 'Gravure'},
        {id: 47, name: 'Lecteur multimédia'},
        {id: 48, name: 'Loader'},
        {id: 49, name: 'Maison'},
        {id: 50, name: 'Météo'},
        {id: 51, name: 'Musique'},
        {id: 52, name: 'Navigateur Web'},
        {id: 53, name: 'Nettoyage et Optimisation'},
        {id: 54, name: 'Organiseur'},
        {id: 55, name: 'Partage de fichiers'},
        {id: 56, name: 'Permis'},
        {id: 57, name: 'Photographie'},
        {id: 58, name: 'Planification'},
        {id: 59, name: 'Reconnaisance'},
        {id: 60, name: 'Référencement'},
        {id: 61, name: 'Registre'},
        {id: 62, name: 'Réseau'},
        {id: 63, name: 'Santé'},
        {id: 64, name: 'Sauvegarde'},
        {id: 65, name: 'Science'},
        {id: 66, name: 'Serveur FTP'},
        {id: 67, name: 'Sport'},
        {id: 68, name: 'Système'},
        {id: 69, name: "Système d'exploitation"},
        {id: 70, name: 'Traducteur'},
        {id: 71, name: 'Utilitaire'},
        {id: 72, name: 'Vidéo'},
        {id: 73, name: 'Wallpaper'},
        {id: 74, name: 'Webcam'} ]},
    FLangue: {id: 'option_langue:multiple[]', name: 'Langue', options: [
        {id: 1, name: 'Anglais'},
        {id: 2, name: 'Français (VFF/Truefrench)'},
        {id: 3, name: 'Muet'},
        {id: 4, name: 'Multi (Français inclus)'},
        {id: 5, name: 'Multi (Québécois inclus)'},
        {id: 6, name: 'Québécois (VFQ/French)'},
        {id: 7, name: 'VFSTFR'},
        {id: 8, name: 'VOSTFR'} ]},
    FQualite: {id: 'option_qualite[]', name: 'Qualité', options: [
        {id: 1, name: 'BDrip/BRrip [Rip SD (non HD) depuis Bluray ou HDrip]'},
        {id: 2, name: 'Bluray 4K [Full ou Remux]'},
        {id: 3, name: 'Bluray [Full]'},
        {id: 4, name: 'Bluray [Remux]'},
        {id: 5, name: 'DVD-R 5 [DVD &lt; 4.37GB]'},
        {id: 6, name: 'DVD-R 9 [DVD &gt; 4.37GB]'},
        {id: 7, name: 'DVDrip [Rip depuis DVD-R]'},
        {id: 8, name: 'HDrip 1080 [Rip HD depuis Bluray]'},
        {id: 9, name: 'HDrip 4k [Rip HD 4k depuis source 4k]'},
        {id: 10, name: 'HDrip 720 [Rip HD depuis Bluray]'},
        {id: 11, name: 'TVrip [Rip SD (non HD) depuis Source Tv HD/SD]'},
        {id: 12, name: 'TVripHD 1080 [Rip HD depuis Source Tv HD]'},
        {id: 13, name: 'TvripHD 4k [Rip HD 4k depuis Source Tv 4k]'},
        {id: 14, name: 'TVripHD 720 [Rip HD depuis Source Tv HD]'},
        {id: 15, name: 'VCD/SVCD/VHSrip'},
        {id: 16, name: 'Web-Dl'},
        {id: 17, name: 'Web-Dl 1080'},
        {id: 18, name: 'Web-Dl 4K'},
        {id: 19, name: 'Web-Dl 720'},
        {id: 20, name: 'WEBrip'},
        {id: 21, name: 'WEBrip 1080'},
        {id: 22, name: 'WEBrip 4K'},
        {id: 23, name: 'WEBrip 720'} ]},
    FSysteme: {id: 'option_systeme[]', name: 'Système', options: [
        {id: 1, name: 'Nintendo Ds/3Ds'},
        {id: 2, name: 'PC/Platine/Lecteur Multimédia/etc'},
        {id: 3, name: 'Smartphone/Tablette/PSP/PSVita'} ]},
    FType: {id: 'option_type[]', name: 'Type', options: [
        {id: 1, name: '2D (Standard)'},
        {id: 2, name: '3D Converti (Non officiel/Amateur)'},
        {id: 3, name: '3D Converti (Post-Production)'},
        {id: 4, name: '3D Natif (Production)'} ]},
    FGenre: {id: 'option_genre:multiple[]', name: 'Genre', options: [
        {id: 1, name: 'Action'},
        {id: 2, name: 'Animalier'},
        {id: 3, name: 'Animation'},
        {id: 4, name: 'Arts'},
        {id: 5, name: 'Arts Martiaux'},
        {id: 6, name: 'Aventure'},
        {id: 7, name: 'Ballet'},
        {id: 8, name: 'Biopic'},
        {id: 9, name: 'Chorégraphie'},
        {id: 10, name: 'Classique'},
        {id: 11, name: 'Comédie'},
        {id: 12, name: 'Comédie dramatique'},
        {id: 13, name: 'Court-métrage'},
        {id: 14, name: 'Culinaire'},
        {id: 15, name: 'Danse contemporaine'},
        {id: 16, name: 'Découverte'},
        {id: 17, name: 'Divers'},
        {id: 18, name: 'Documentaire'},
        {id: 19, name: 'Drame'},
        {id: 20, name: 'Enquête'},
        {id: 21, name: 'Epouvante & Horreur'},
        {id: 22, name: 'Espionnage'},
        {id: 23, name: 'Famille'},
        {id: 24, name: 'Fantastique'},
        {id: 25, name: 'Fiction'},
        {id: 26, name: 'Film Noir'},
        {id: 27, name: 'Gore'},
        {id: 28, name: 'Guerre'},
        {id: 29, name: 'Historique'},
        {id: 30, name: 'Humour'},
        {id: 31, name: 'Intéractif'},
        {id: 32, name: 'Judiciaire'},
        {id: 33, name: 'Litterature'},
        {id: 34, name: 'Manga'},
        {id: 35, name: 'Musical'},
        {id: 36, name: 'Nanar'},
        {id: 37, name: 'Nature'},
        {id: 38, name: 'Opéra'},
        {id: 39, name: 'Opéra Rock'},
        {id: 40, name: 'Pédagogie'},
        {id: 41, name: 'Péplum'},
        {id: 42, name: 'Philosophie'},
        {id: 43, name: 'Policier'},
        {id: 44, name: 'Politique & Géopolitique'},
        {id: 45, name: 'Religions & Croyances'},
        {id: 46, name: 'Romance'},
        {id: 47, name: 'Santé & Bien-être'},
        {id: 48, name: 'Science fiction'},
        {id: 49, name: 'Sciences & Technologies'},
        {id: 50, name: 'Société'},
        {id: 51, name: 'Sports & Loisirs'},
        {id: 52, name: 'Télé-Réalité'},
        {id: 53, name: 'Théatre'},
        {id: 54, name: 'Thriller'},
        {id: 55, name: 'Variétés TV'},
        {id: 56, name: 'Voyages & Tourisme'},
        {id: 57, name: 'Western'} ]},
    FSaison: {id: 'option_saison[]', name: 'Saison', options: [
        {id: 1, name: 'Série intégrale'},
        {id: 2, name: 'Hors saison'},
        {id: 3, name: 'Non communiqué'},
        {id: 4, name: 'Saison 01'},
        {id: 5, name: 'Saison 02'},
        {id: 6, name: 'Saison 03'},
        {id: 7, name: 'Saison 04'},
        {id: 8, name: 'Saison 05'},
        {id: 9, name: 'Saison 06'},
        {id: 10, name: 'Saison 07'},
        {id: 11, name: 'Saison 08'},
        {id: 12, name: 'Saison 09'},
        {id: 13, name: 'Saison 10'},
        {id: 14, name: 'Saison 11'},
        {id: 15, name: 'Saison 12'},
        {id: 16, name: 'Saison 13'},
        {id: 17, name: 'Saison 14'},
        {id: 18, name: 'Saison 15'},
        {id: 19, name: 'Saison 16'},
        {id: 20, name: 'Saison 17'},
        {id: 21, name: 'Saison 18'},
        {id: 22, name: 'Saison 19'},
        {id: 23, name: 'Saison 20'},
        {id: 24, name: 'Saison 21'},
        {id: 25, name: 'Saison 22'},
        {id: 26, name: 'Saison 23'},
        {id: 27, name: 'Saison 24'},
        {id: 28, name: 'Saison 25'},
        {id: 29, name: 'Saison 26'},
        {id: 30, name: 'Saison 27'},
        {id: 31, name: 'Saison 28'},
        {id: 32, name: 'Saison 29'},
        {id: 33, name: 'Saison 30'} ]},
    FEpisode: {id: 'option_episode[]', name: 'Épisode', options: [
        {id: 1, name: 'Saison complète'},
        {id: 2, name: 'Épisode 01'},
        {id: 3, name: 'Épisode 02'},
        {id: 4, name: 'Épisode 03'},
        {id: 5, name: 'Épisode 04'},
        {id: 6, name: 'Épisode 05'},
        {id: 7, name: 'Épisode 06'},
        {id: 8, name: 'Épisode 07'},
        {id: 9, name: 'Épisode 08'},
        {id: 10, name: 'Épisode 09'},
        {id: 11, name: 'Épisode 10'},
        {id: 12, name: 'Épisode 11'},
        {id: 13, name: 'Épisode 12'},
        {id: 14, name: 'Épisode 13'},
        {id: 15, name: 'Épisode 14'},
        {id: 16, name: 'Épisode 15'},
        {id: 17, name: 'Épisode 16'},
        {id: 18, name: 'Épisode 17'},
        {id: 19, name: 'Épisode 18'},
        {id: 20, name: 'Épisode 19'},
        {id: 21, name: 'Épisode 20'},
        {id: 22, name: 'Épisode 21'},
        {id: 23, name: 'Épisode 22'},
        {id: 24, name: 'Épisode 23'},
        {id: 25, name: 'Épisode 24'},
        {id: 26, name: 'Épisode 25'},
        {id: 27, name: 'Épisode 26'},
        {id: 28, name: 'Épisode 27'},
        {id: 29, name: 'Épisode 28'},
        {id: 30, name: 'Épisode 29'},
        {id: 31, name: 'Épisode 30'},
        {id: 32, name: 'Épisode 31'},
        {id: 33, name: 'Épisode 32'},
        {id: 34, name: 'Épisode 33'},
        {id: 35, name: 'Épisode 34'},
        {id: 36, name: 'Épisode 35'},
        {id: 37, name: 'Épisode 36'},
        {id: 38, name: 'Épisode 37'},
        {id: 39, name: 'Épisode 38'},
        {id: 40, name: 'Épisode 39'},
        {id: 41, name: 'Épisode 40'},
        {id: 42, name: 'Épisode 41'},
        {id: 43, name: 'Épisode 42'},
        {id: 44, name: 'Épisode 43'},
        {id: 45, name: 'Épisode 44'},
        {id: 46, name: 'Épisode 45'},
        {id: 47, name: 'Épisode 46'},
        {id: 48, name: 'Épisode 47'},
        {id: 49, name: 'Épisode 48'},
        {id: 50, name: 'Épisode 49'},
        {id: 51, name: 'Épisode 50'},
        {id: 52, name: 'Épisode 51'},
        {id: 53, name: 'Épisode 52'},
        {id: 54, name: 'Épisode 53'},
        {id: 55, name: 'Épisode 54'},
        {id: 56, name: 'Épisode 55'},
        {id: 57, name: 'Épisode 56'},
        {id: 58, name: 'Épisode 57'},
        {id: 59, name: 'Épisode 58'},
        {id: 60, name: 'Épisode 59'},
        {id: 61, name: 'Épisode 60'},
        {id: 62, name: 'Non communiqué'} ]}
}

export const SubCats = {
    Karaoke: { id: 2147, name: 'Karaoké', filterFields: [
        FilterFields.KType ] },
    Musique: { id: 2148, name: 'Musique', filterFields: [
        FilterFields.MFormat,
        FilterFields.MQualite,
        FilterFields.MType,
        FilterFields.MGenre ] },
    Sample: { id: 2149, name: 'Samples', filterFields: [
        FilterFields.MFormat,
        FilterFields.MGenre ] },
    PodcastRadio: { id: 2150, name: 'Podcast radio', filterFields: [
        FilterFields.MFormat,
        FilterFields.PGenre ] },

    AudioBook: { id: 2151, name: 'Livre audio', filterFields: [
        FilterFields.MFormat,
        FilterFields.MType,
        FilterFields.ALLangue,
        FilterFields.ALGenre ] },
    BD: { id: 2152, name: 'BD', filterFields: [
        FilterFields.BDFormat,
        FilterFields.ALLangue,
        FilterFields.ALGenre ] },
    Comics: { id: 2153, name: 'Comics', filterFields: [
        FilterFields.BDFormat,
        FilterFields.ALLangue,
        FilterFields.ALGenre ] },
    Livre: { id: 2154, name: 'Livre', filterFields: [
        FilterFields.BDFormat,
        FilterFields.ALLangue,
        FilterFields.ALGenre ] },
    Manga: { id: 2155, name: 'Manga', filterFields: [
        FilterFields.BDFormat,
        FilterFields.ALLangue,
        FilterFields.ALGenre ] },
    Presse: { id: 2156, name: 'Presse', filterFields: [
        FilterFields.BDFormat,
        FilterFields.ALLangue,
        FilterFields.ALGenre ] },

    Emulateur: { id: 2157, name: 'Émulateur', filterFields: [
        FilterFields.ESysteme ] },
    ROM: { id: 2158, name: 'ROM', filterFields: [
        FilterFields.ESysteme ] },

    VGLinux: { id: 2159, name: 'Linux', filterFields: [
        FilterFields.ALLangue,
        FilterFields.VGGenre ] },
    VGMacOS: { id: 2160, name: 'MacOS', filterFields: [
        FilterFields.ALLangue,
        FilterFields.VGGenre ] },
    VGWindows: { id: 2161, name: 'Windows', filterFields: [
        FilterFields.ALLangue,
        FilterFields.VGGenre ] },
    VGMicrosoft: { id: 2162, name: 'Microsoft', filterFields: [
        FilterFields.ALLangue,
        FilterFields.VGGenre,
        FilterFields.VGMConsole ] },
    VGNintendo: { id: 2163, name: 'Nintendo', filterFields: [
        FilterFields.ALLangue,
        FilterFields.VGGenre,
        FilterFields.VGNConsole ] },
    VGSony: { id: 2164, name: 'Sony', filterFields: [
        FilterFields.ALLangue,
        FilterFields.VGGenre,
        FilterFields.VGSConsole ] },
    VGSPhone: { id: 2165, name: 'Smartphone', filterFields: [
        FilterFields.ALLangue,
        FilterFields.VGGenre,
        FilterFields.VGSysteme ] },
    VGTablette: { id: 2166, name: 'Tablette', filterFields: [
        FilterFields.ALLangue,
        FilterFields.VGGenre,
        FilterFields.VGSysteme ] },
    VGAutre: { id: 2167, name: 'Autre', filterFields: [
        FilterFields.ALLangue,
        FilterFields.VGGenre ] },

    MapApp: { id: 2168, name: 'Application', filterFields: [
        FilterFields.MAPSysteme ] },
    MapCarte: { id: 2169, name: 'Carte', filterFields: [
         ] },
    MapDivers: { id: 2170, name: 'Divers', filterFields: [
         ] },

    PGLinux: { id: 2171, name: 'Linux', filterFields: [
        FilterFields.PGGenre,
        FilterFields.ALLangue ] },
    PGMacOS: { id: 2172, name: 'MacOS', filterFields: [
        FilterFields.PGGenre,
        FilterFields.ALLangue ] },
    PGWindows: { id: 2173, name: 'Windows', filterFields: [
        FilterFields.PGGenre,
        FilterFields.ALLangue ] },
    PGSPhone: { id: 2174, name: 'Smartphone', filterFields: [
        FilterFields.PGGenre,
        FilterFields.ALLangue,
        FilterFields.VGSysteme ] },
    PGTablette: { id: 2175, name: 'Tablette', filterFields: [
        FilterFields.PGGenre,
        FilterFields.ALLangue,
        FilterFields.VGSysteme ] },
    Formation: { id: 2176, name: 'Formation', filterFields: [
        FilterFields.PGGenre,
        FilterFields.ALLangue ] },
    PGAutre: { id: 2177, name: 'Autre', filterFields: [
        FilterFields.PGGenre,
        FilterFields.ALLangue ] },

    Animation: { id: 2178, name: 'Animation', filterFields: [
        FilterFields.FLangue,
        FilterFields.FQualite,
        FilterFields.FSysteme,
        FilterFields.FType,
        FilterFields.FGenre ] },
    AnimationSerie: { id: 2179, name: 'Animation série', filterFields: [
        FilterFields.FEpisode,
        FilterFields.FSaison,
        FilterFields.FLangue,
        FilterFields.FQualite,
        FilterFields.FSysteme,
        FilterFields.FType,
        FilterFields.FGenre ] },
    Concert: { id: 2180, name: 'Concert', filterFields: [
        FilterFields.FLangue,
        FilterFields.FQualite,
        FilterFields.FSysteme,
        FilterFields.FType ] },
    Documentaire: { id: 2181, name: 'Documentaire', filterFields: [
        FilterFields.FLangue,
        FilterFields.FQualite,
        FilterFields.FSysteme,
        FilterFields.FType,
        FilterFields.FGenre ] },
    Emission: { id: 2182, name: 'Emission', filterFields: [
        FilterFields.FEpisode,
        FilterFields.FSaison,
        FilterFields.FLangue,
        FilterFields.FQualite,
        FilterFields.FSysteme,
        FilterFields.FType,
        FilterFields.FGenre ] },
    Film: { id: 2183, name: 'Film', filterFields: [
        FilterFields.FLangue,
        FilterFields.FQualite,
        FilterFields.FSysteme,
        FilterFields.FType,
        FilterFields.FGenre ] },
    Serie: { id: 2184, name: 'Série TV', filterFields: [
        FilterFields.FEpisode,
        FilterFields.FSaison,
        FilterFields.FLangue,
        FilterFields.FQualite,
        FilterFields.FSysteme,
        FilterFields.FType,
        FilterFields.FGenre ] },
    Spectacle: { id: 2185, name: 'Spectacle', filterFields: [
        FilterFields.FLangue,
        FilterFields.FQualite,
        FilterFields.FSysteme,
        FilterFields.FType,
        FilterFields.FGenre ] },
    Sport: { id: 2186, name: 'Sport', filterFields: [
        FilterFields.FLangue,
        FilterFields.FQualite,
        FilterFields.FSysteme,
        FilterFields.FType ] },
    VideoClip: { id: 2187, name: 'Vidéo-clip', filterFields: [
        FilterFields.FLangue,
        FilterFields.FQualite,
        FilterFields.FSysteme,
        FilterFields.FType ] },

    XXFilm: { id: 2189, name: 'Film', filterFields: [
         ] },
    XXHentai: { id: 2190, name: 'Hentai', filterFields: [
         ] },
    XXImages: { id: 2191, name: 'Images', filterFields: [
         ] }
}

export const Cats = {
    Audio: { id: 2139, name: 'Audio', subCats: [
      SubCats.Karaoke,
      SubCats.Musique,
      SubCats.Sample,
      SubCats.PodcastRadio ] },
    eBook: { id: 2140, name: 'eBook', subCats: [
      SubCats.AudioBook,
      SubCats.BD,
      SubCats.Comics,
      SubCats.Livre,
      SubCats.Manga,
      SubCats.Presse ] },
    Emulation: { id: 2141, name: 'Émulation', subCats: [
      SubCats.Emulateur,
      SubCats.ROM ] },
    JeuVideo: { id: 2142, name: 'Jeu vidéo', subCats: [
      SubCats.VGLinux,
      SubCats.VGMacOS,
      SubCats.VGWindows,
      SubCats.VGMicrosoft,
      SubCats.VGNintendo,
      SubCats.VGSony,
      SubCats.VGSPhone,
      SubCats.VGTablette,
      SubCats.VGAutre ] },
    GPS: { id: 2143, name: 'GPS', subCats: [
      SubCats.MapApp,
      SubCats.MapCarte,
      SubCats.MapDivers ] },
    Application: { id: 2144, name: 'Application', subCats: [
      SubCats.PGLinux,
      SubCats.PGMacOS,
      SubCats.PGWindows,
      SubCats.PGSPhone,
      SubCats.PGTablette,
      SubCats.Formation,
      SubCats.PGAutre ] },
    FilmVideo: { id: 2145, name: 'Film/Vidéo', subCats: [
      SubCats.Animation,
      SubCats.AnimationSerie,
      SubCats.Concert,
      SubCats.Documentaire,
      SubCats.Emission,
      SubCats.Film,
      SubCats.Serie,
      SubCats.Spectacle,
      SubCats.Sport,
      SubCats.VideoClip ] },
    XXX: { id: 2188, name: 'XXX', subCats: [
      SubCats.XXFilm,
      SubCats.XXHentai,
      SubCats.XXImages ] }
}

export const cats = Object.values(Cats)
export const subCats = Object.values(SubCats)

function zip(...ls) {
    return ls[0].map((_, i) => ls.map(l => l[i]))
}

function partition(xs, p) {
    return xs.reduce(([l, r], v) => p(v) ? [[...l, v], r] : [l, [...r, v]], [[], []])
}

function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach(item => {
         const key = keyGetter(item);
         const collection = map.get(key);
         if (!collection) {
             map.set(key, [item]);
         } else {
             collection.push(item);
         }
    });
    return map;
}

function transmissionFilesToTree(fs, ws, ps) {
    return zip(fs, ws, ps).map(([f, w, p], i) => {
        return {
            tag: "File",
            filedetails: {
                bytesCompleted: f.bytesCompleted,
                length: f.length,
                wanted: w === 1,
                priority: p,
                id: i
            },
            filename: f.name
        }
    })
}

function buildTreeFromFiles(fs) {
    function btffs(fss) {
        const [files, deepfiles] = partition(fss, f => f.filename.length === 1)
        const deepfilesg = groupBy(deepfiles, f => f.filename[0])
        return files.map(f => { return { ...f, filename: f.filename[0] } }).concat(
            Array.from(deepfilesg.entries(), ([k, v]) => {
                return {
                    tag: "Directory",
                    dirname: k,
                    dircontent: btffs(v.map(f => { return { ...f, filename: f.filename.slice(1) } }))
                }
            }))
    }
    return btffs(fs.map(f => { return { ...f, filename: f.filename.split('/') } }))
}
