import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Icon from '@mdi/react';
import { mdiTextBoxOutline, mdiFolderOpenOutline, mdiInformationOutline, mdiCommentMultipleOutline, mdiAccountMultipleOutline,
    mdiTextBox, mdiFolderOpen, mdiInformation, mdiCommentMultiple, mdiClose, mdiAccountMultiple, mdiViewComfy, mdiViewComfyOutline, mdiNetwork, mdiNetworkOutline } from '@mdi/js';
import parse from 'html-react-parser'
import { useState, useEffect, useRef } from 'react';
import FileExplorer from './FileExplorer';
import Comment from './Comment';
import Peer from './Peer';
import TorrentFileItem from './TorrentFileItem';
import { DotLoader } from 'react-spinners';
import { useTransmission } from '../transmission-context';
import { tryGetTorrentFromTid, getTrTID, tryGetTorrentFromId, fetchjson, urlFromTorUrlEnd } from '../utils';
import Pieces from './Pieces';
import Tracker from './Tracker';

const withLoading = isLoading => comp => {
    return isLoading === true ? <div className='loader h100 fc cc' ><DotLoader color='mediumturquoise' /></div>
         : isLoading ===  null ? <div className='loader h100 fc cc' ><Icon path={mdiClose} color='tomato' size={5} /></div>
         : isLoading ===  undefined ? <div className='loader h100 fc cc indisp' >indisponible</div>
         : comp
}

export default function TorrentInfos(props) {
    const [sI, setSI] = useState(0)
    const trTL = useTransmission()

    const isTR = props.id != null
    const tf = props.tf
    const t = isTR ? tryGetTorrentFromId(trTL, props.id) : tf ? tryGetTorrentFromTid(trTL, tf.tid) : null
    const id = props.id ?? t?.id
    const urlend = tf?.torurlend ?? t?.torurlend

    const [ti, setTI] = useState()
    const [ isLoadingTI, setIsLoadingTI ] = useState()
    const wl = withLoading (isLoadingTI)
    useEffect(() => (async function() {
        setIsLoadingTI(true)
        setTI(undefined)
        if (urlend != null) {
            try {
                const ti = await fetchjson(urlFromTorUrlEnd(urlend))
                setTI(ti)
                setIsLoadingTI(false)
            }
            catch { setIsLoadingTI(null) }
        }
        else setIsLoadingTI(undefined)
    })(), [urlend])
    
    const [td, setTD] = useState()
    const [ isLoadingTD, setIsLoadingTD ] = useState()
    const wd = withLoading (isLoadingTD)
    const hr = useRef()
    useEffect(() => {
        setIsLoadingTD(true)
        clearInterval(hr.current)
        setTD(undefined)
        if (id != null) {
            hr.current = setInterval(async () => {
                const td = await getTrTID(id)
                setTD(td)
                if (td === undefined) setIsLoadingTD(undefined)
                else setIsLoadingTD(false)
            }, 500)
        }
        else setIsLoadingTD(undefined)
    }, [id])

    const wdl = withLoading (isLoadingTD === undefined ? isLoadingTI : isLoadingTD)
    const files = td?.filetree ?? ti?.content
    
    return <div className='fc ti h100'>
        {(tf || t) && <header>
           <TorrentFileItem rm={false} enableLink={true} big={true} t={t} tf={tf} ti={ti} footer={ti != null} />
         </header>}
        <Tabs className='f1 react-tabs' onSelect={setSI}>
            <TabPanel>{wl(ti && <div className='os h100 tipres'>{ti.presentation && parse(ti.presentation)}</div>)}</TabPanel>
            <TabPanel>{wdl(files && <FileExplorer id={id} isTR={td != null} data={files}/>)}</TabPanel>
            <TabPanel>{wl(ti && <div className='os h100 tinfo'>{ti.nfo && parse(ti.nfo)}</div>)}</TabPanel>
            <TabPanel>{wl(ti && <ul className='comlist h100'>{ti.comments.map(com => <li key={com}><Comment com={com}/></li>)}</ul>)} </TabPanel>
            <TabPanel>{wd(td && <ul className='peerlist h100'>{td.peers.map((peer, index) => <li key={peer} className={'peeritem ' + (index % 2 === 0 ? 'fff' : 'ff5')}><Peer peer={peer} /></li>)}</ul>)} </TabPanel>
            <TabPanel>{wd(td && <ul className='trackerlist h100'>{td.trackerStats.map(tr => <li key={tr.id}><Tracker tr={tr} /></li>)}</ul>)} </TabPanel>
            <TabPanel>{wd(td && <div className='piecesitem os h100' ><Pieces piecesarray={td.piecesarray} pieceHaveCount={td.pieceHaveCount} pieceCount={td.pieceCount} pieceSize={td.pieceSize} /></div>)} </TabPanel>
            <TabList>
                <Tab ><Icon className='tab-icon' path={sI === 0 ? mdiTextBox : mdiTextBoxOutline} /></Tab>
                <Tab><Icon className='tab-icon' path={sI === 1 ? mdiFolderOpen : mdiFolderOpenOutline} /></Tab>
                <Tab><Icon className='tab-icon' path={sI === 2 ? mdiInformation : mdiInformationOutline} /></Tab>
                <Tab><Icon className='tab-icon' path={sI === 3 ? mdiCommentMultiple : mdiCommentMultipleOutline} /></Tab>
                <Tab><Icon className='tab-icon' path={sI === 4 ? mdiAccountMultiple : mdiAccountMultipleOutline} /></Tab>
                <Tab><Icon className='tab-icon' path={sI === 5 ? mdiNetwork : mdiNetworkOutline} /></Tab>
                <Tab><Icon className='tab-icon' path={sI === 6 ? mdiViewComfy : mdiViewComfyOutline} /></Tab>
            </TabList>
        </Tabs>
    </div>
}