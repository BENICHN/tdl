import { useState, useEffect } from "react"
import { fetchjson, hYGGHost, stringFromSize, toString2, yggConfig } from '../utils'
import Icon from '@mdi/react'
import { mdiArrowDown, mdiArrowUp, mdiDivision, mdiFormatListBulleted, mdiRefresh } from '@mdi/js'

export default function StatusBar(props) {
    const [ud, setUD] = useState(null)

    useEffect(() => (async function f() { if (!ud) await fetchjson(hYGGHost + '/user').then(setUD) })(), [ud])

    return <div className='statusbar fr ca'>
        <div className='ud fr ca'>
            <button className='btn' onClick={() => setUD(null)} ><Icon className='icon' path={mdiRefresh} /> </button>
            {ud && [<div className='udname'>{yggConfig.yggid}</div>,
            <div className='udupdown udup fr ca'><Icon className='icon' path={mdiArrowUp} />{stringFromSize(ud.udupsize)}</div>,
            <div className='udupdown uddown fr ca'><Icon className='icon' path={mdiArrowDown} />{stringFromSize(ud.uddownsize)}</div>,
            <div className={'udratio fr ca' + (ud.udactivity ? ' act' : ' noact')}><Icon className='icon' path={mdiDivision} />{toString2(ud.udratio)}</div>]}
        </div>
        <div className='f1' />
        <div className='btns fr'>
            <button className='btn' onClick={props.onSetIsLib} ><Icon className='icon' path={mdiFormatListBulleted} /></button>
        </div>
    </div>
}