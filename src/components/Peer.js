import { FiChevronsUp, FiChevronsDown, FiBox, FiUser } from 'react-icons/fi'
import { stringFromSize } from '../utils'

export default function Peer(props) {
    const peer = props.peer
    return <div className='peer fr ca' >
        <div className='fr ca addr' ><FiUser className='icon' />{peer.address}:{peer.port}</div>
        <div className='fr ca client ol' ><FiBox className='icon' />{peer.clientName}</div>
        <div className='fr ca f1' />
        <div className='fr ca dl' ><FiChevronsDown className='icon' />{stringFromSize(peer.rateToClient)}/s</div>
        <div className='fr ca ul' ><FiChevronsUp className='icon' />{stringFromSize(peer.rateToPeer)}/s</div>
    </div>
}