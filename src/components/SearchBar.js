import Icon from '@mdi/react';
import { mdiMenuDown, mdiAlphaABoxOutline, mdiMenuSwapOutline, mdiFilterVariant, mdiSortVariant, mdiClockOutline, mdiFileOutline, mdiChevronUpCircleOutline, mdiChevronDownCircleOutline, mdiCircleOutline,
    mdiClock, mdiFile, mdiChevronUpCircle, mdiChevronDownCircle, mdiCircle, mdiMenuUp, mdiAlphaABox, mdiMagnify } from '@mdi/js';
import { useState } from 'react';
import Filter from './Filter';

export default function SearchBar(props) {
    const [isSorting, setIsSorting] = useState(false)
    const [isFiltering, setIsFiltering] = useState(false)
    const [sq, setSQ] = useState({
        name: '',
        page: 0,
        sort: "",
        order: '',
        filter: new FormData()
    })

    function setAndSendSQ(nsq) {
        setSQ(nsq)
        props.onSubmit(nsq)
    }

    return <div className='fc searchbar'>
        <div className='searchbartop fr'>
            <button className='filterbutton' onClick={() => setIsFiltering(!isFiltering)}><Icon className='icon' path={mdiFilterVariant} /></button>
            <form className='f1 fr oh' onSubmit={e => { e.preventDefault(); props.onSubmit(sq) }} onChange={e => setSQ({ ...sq, name: e.target.value }) } >
                <button type='submit'><Icon className='icon' path={mdiMagnify} /></button>
                <input className='f1 w100' onFocus={() => setIsSorting(false)} onSubmit={console.log} type='text' placeholder='Rechercher...' />
            </form>
            {isSorting ? <div className='fr sortbuttons sbh'>
                <button onClick={() => setAndSendSQ({ ...sq, sort: sq.sort === 'name' ? '' : 'name' })}><Icon className='icon' path={sq.sort === 'name' ? mdiAlphaABox : mdiAlphaABoxOutline} /></button>
                <button onClick={() => setAndSendSQ({ ...sq, sort: sq.sort === 'publish_date' ? '' : 'publish_date' })}><Icon className='icon' path={sq.sort === 'publish_date' ? mdiClock : mdiClockOutline} /></button>
                <button onClick={() => setAndSendSQ({ ...sq, sort: sq.sort === 'size' ? '' : 'size' })}><Icon className='icon' path={sq.sort === 'size' ? mdiFile : mdiFileOutline} /></button>
                <button onClick={() => setAndSendSQ({ ...sq, sort: sq.sort === 'seed' ? '' : 'seed' })}><Icon className='icon' path={sq.sort === 'seed' ? mdiChevronUpCircle : mdiChevronUpCircleOutline} /></button>
                <button onClick={() => setAndSendSQ({ ...sq, sort: sq.sort === 'leech' ? '' : 'leech' })}><Icon className='icon' path={sq.sort === 'leech' ? mdiChevronDownCircle : mdiChevronDownCircleOutline} /></button>
                <button onClick={() => setAndSendSQ({ ...sq, sort: sq.sort === 'completed' ? '' : 'completed' })}><Icon className='icon' path={sq.sort === 'completed' ? mdiCircle : mdiCircleOutline} /></button>
            </div>
                : <button onClick={() => setIsSorting(true)}><Icon className='icon' path={mdiSortVariant} /></button>}
            <button className='orderbutton' onClick={() => setAndSendSQ({ ...sq, order: sq.order === 'asc' ? 'desc' : sq.order === 'desc' ? '' : 'asc' })}><Icon className={'icon' + (sq.order === '' ? '' : ' ordericon')} path={sq.order === 'asc' ? mdiMenuUp : sq.order === 'desc' ? mdiMenuDown : mdiMenuSwapOutline} /></button>
        </div>
        <div className={'searchbarbottom' + (isFiltering ? '' : ' h')}>
            <Filter onChange={fd => setSQ({...sq, filter: fd})} />
        </div>
    </div>
}