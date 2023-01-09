import { stringFromSize } from "../utils";

export default function Pieces(props) {
    return <div>
        <div className='piececs'>{props.pieceHaveCount}/{props.pieceCount} pièces de {stringFromSize(props.pieceSize)}</div>
        <div className='pieces fr' >
            {props.piecesarray.map(p => <div className={'piece ' + (p ? 'y' : '')} />)}
        </div>
    </div>
}