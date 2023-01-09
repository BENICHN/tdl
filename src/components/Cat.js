export default function Cat({cat}) {
    return <img src={'images/' + cat + '.png'} alt={cat} className='cat' />
}