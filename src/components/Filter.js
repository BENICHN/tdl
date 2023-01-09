import { useRef, useState } from "react";
import { cats, last, subCats } from '../utils'

export default function Filter(props) {
    const [cat, setCat] = useState(null)
    const [subcat, setSubCat] = useState(null)
    const formRef = useRef()

    return <form ref={formRef} className='filter' onChange={() => {props.onChange(new FormData(formRef.current))}}>
        <div className='fr'>
            <select className={'filterselect' + (cat ? '' : ' ph')} name='category' title='Catégorie' onChange={({target}) => {const nc = cats.find(c => c.id.toString() === target.value); if (nc !== cat) setSubCat(null); setCat(nc)}} >
                {[<option value='all' selected >Toutes catégories</option>].concat(cats.map(c => <option value={c.id}>{c.name}</option>))}
            </select>
            {cat ? <select className={'filterselect' + (subcat ? '' : ' ph')} name='sub_category' title='Sous-catégorie' onChange={({target}) => setSubCat(subCats.find(c => c.id.toString() === target.value))} >
                {[<option value='all' selected >Toutes sous-catégories</option>].concat(cat.subCats.map(c => <option value={c.id}>{c.name}</option>))}
            </select> : <div className='filterselect'></div>}
        </div>
        {subcat && <div className='fr filterdetails'>
            {subcat.filterFields.map(f => <select name={f.id} className='filterselect ph' title={f.name} multiple required onChange={({target}) => {
                if (target.value.length === 0) {
                    last(target.children).selected = true
                    target.className = 'filterselect ph'
                } else {
                    last(target.children).selected = false
                    target.className = 'filterselect'
                }
                console.log(target.value) }} >{f.options.map(o => <option value={o.id}>{o.name}</option>).concat([<option value='' disabled selected hidden>{f.name}</option>])}
            </select>)}
        </div>}
    </form>
}