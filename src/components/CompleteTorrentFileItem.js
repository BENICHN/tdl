import TorrentFileItem from "./TorrentFileItem"

export default function CompleteTorrentFileHeader(props) {
    return <div className='ctfi'>
        <TorrentFileItem enableLink={props.enableLink} big={true} tf={props.ti.baseinfo} />
        <div className='tfcompl'>Uploadé{props.ti.uploader ? ' par ' : ''}{props.ti.uploader ? <a href={props.ti.uploader.upurl}><i>{props.ti.uploader.upname}</i></a> : ''} le {props.ti.date} à {props.ti.hour}</div>
    </div>
}