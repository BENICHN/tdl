import { FiFile, FiClock, FiChevronUp, FiChevronDown, FiMessageCircle, FiCircle, FiDownload, FiChevronsDown, FiChevronsUp, FiUsers, FiUpload, FiSettings, FiPause, FiMoreHorizontal } from 'react-icons/fi'
import { addTorrent, fetchtrrpc, startTorrent, stopTorrent, stringFromSize, toString2, tryGetTorrentFromTid, yggConfig } from '../utils'
import Icon from '@mdi/react'
import { mdiArrowDownBoldOutline, mdiDeleteOutline, mdiPause, mdiPlayOutline } from "@mdi/js"
import { useTransmission } from '../transmission-context'
import Cat from './Cat'
import useLongPress from '../useLongPress'
import SwipeToDelete from 'react-swipe-to-delete-ios'

export default function TorrentFileItem(props) {
    const trTL = useTransmission()

    const tf = props.tf
    const t = props.t ?? tryGetTorrentFromTid(trTL, tf?.tid)
    const urlend = tf?.torurlend ?? t?.torurlend

    const lpe = useLongPress(() => addTorrent(tf, false), () => addTorrent(tf, true))

    function TStatus({status, color}) {
        switch (status) {
            case 0:
              return <FiPause className='icon' color={color} />
            case 1:
              return <FiMoreHorizontal className='icon' color={color} />
            case 2:
              return <FiSettings className='icon' color={color} />
            case 3:
              return <FiMoreHorizontal className='icon' color={color} />
            case 4:
              return <FiDownload className='icon' color={color} />
            case 5:
              return <FiMoreHorizontal className='icon' color={color} />
            case 6:
              return <FiUpload className='icon' color={color} />
            default:
              return <FiFile />
        }
    }

    const TIInfos = () => <div className='fr ac' >
        <Cat cat={tf.cat} />
        <div className='fr ac tfidetails tsize'>
            <FiFile className='icon' />
            <div className='ol tfitext'>{stringFromSize(tf.fileinfo.size)}</div>
        </div>
        <div className='fr ac tfidetails tage'>
            <FiClock className='icon' />
            <div className='ol tfitext'>{tf.age}</div>
        </div>
        <div className='f1' />
        <div className='fr ac tfidetails tcoms'>
            <FiMessageCircle className='icon' />
            <div className='ol tfitext'>{tf.coms}</div>
        </div>
        <div className='fr ac tfidetails tseeders'>
            <FiChevronUp className='icon' />
            <div className='ol tfitext'>{tf.slc.seeders}</div>
        </div>
        <div className='fr ac tfidetails tleechers'>
            <FiChevronDown className='icon' />
            <div className='ol tfitext'>{tf.slc.leechers}</div>
        </div>
        <div className='fr ac tfidetails tcompl'>
            <FiCircle className='icon' />
            <div className='ol tfitext'>{tf.slc.compl}</div>
        </div>
      </div>
    
    const TIDL = ({cat}) => {
      const isFinished = t.percentDone === 1
      return <div className='fr ac'>
        {cat && <Cat cat={t.cat} />}
        <div className='fr ac tfidetails tprog'>
            {isFinished ? <>
            <TStatus status={t.status} color={isFinished ? 'green' : 'black'} />
            <div className='ol tfitext'>{stringFromSize(t.uploadedEver)}/{stringFromSize(t.totalSize)} (ratio: {toString2(t.uploadRatio)})</div>
            </> : <>
            <TStatus status={t.status} color={isFinished ? 'green' : 'black'} />
            <div className='ol tfitext'>{stringFromSize(t.haveValid + t.haveUnchecked)}/{stringFromSize(t.totalSize)} ({toString2(t.percentDone * 100)}%)</div></>}
        </div>
        <div className='f1' />
        <div className='fr ac tfidetails tdpeers'>
            <FiUsers className='icon' />
            <div className='ol tfitext'>{t.peersConnected}</div>
        </div>
        <div className='fr ac tfidetails tdspeed'>
            <FiChevronsDown className='icon' />
            <div className='ol tfitext'>{stringFromSize(t.rateDownload)}/s</div>
        </div>
        <div className='fr ac tfidetails tuspeed'>
            <FiChevronsUp className='icon' />
            <div className='ol tfitext'>{stringFromSize(t.rateUpload)}/s</div>
        </div>
      </div>}

    return <SwipeToDelete disabled={!props.rm} deleteComponent={<Icon path={mdiDeleteOutline} color='white' size='22px' />} deleteWidth={35} onDelete={() => fetchtrrpc({
      method: 'torrent-remove',
      arguments: {
        ids: [ t.id ],
        'delete-local-data': true
      }
    })}>
      <div className='wh tfi fr'>
              <div className={'oh tfil f1' + (props.enableLink ? '' : ' opbutton')} onClick={props.onClick} >
                <a href={props.enableLink && (yggConfig.hostName + urlend)}>
                  <em className={props.big ? '' : 'ol'}>{t?.name ?? tf.fileinfo.name}</em>
                  {t && <TIDL cat={true} />}
                  {(!t) && <TIInfos />}
                </a>
                {props.footer && <div className='tfifooter'>Uploadé{props.ti.uploader ? ' par ' : ''}{props.ti.uploader ? <a href={props.ti.uploader.upurl}><i>{props.ti.uploader.upname}</i></a> : ''} le {props.ti.date} à {props.ti.hour}{t && ' (il y a ' + props.ti.baseinfo.age + ')'}</div>}
              </div>
          <div className='tfir'>
            {t ? (t.status === 0 ? <button className='pl fr cc' onClick={() => startTorrent(t.id)} >
                <Icon className='icon' path={mdiPlayOutline} />
            </button> : <button className='pz fr cc' onClick={() => stopTorrent(t.id)} >
                <Icon className='icon' path={mdiPause} />
            </button>) : <button className='dl fr cc' {...lpe} >
                <Icon className='icon' path={mdiArrowDownBoldOutline} />
            </button>}
          </div>
      </div>
    </SwipeToDelete>
}