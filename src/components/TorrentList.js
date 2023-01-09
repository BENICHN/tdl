import SearchBar from "./SearchBar";
import TorrentFileItem from "./TorrentFileItem";
import React, { useRef, useState } from "react";
import { fetchjson, urlFromSearchQuery } from "../utils";
import { useTransmission } from "../transmission-context";
import Icon from '@mdi/react';
import { mdiPlus, mdiClose } from '@mdi/js';
import PropagateLoader from "react-spinners/PropagateLoader";

export default function TorrentList(props) {
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const refsqp = useRef({
    sq: null,
    p: 0
  })
  const [sr, setSR] = useState(null);
  const trTL = useTransmission()

  async function onSearch(sq) {
    setIsLoadingResults(true)
    setSR(null)
    refsqp.current.sq = sq
    refsqp.current.page = 0
    const url = urlFromSearchQuery(sq)
    try {
      await fetchjson(url).then(setSR)
      setIsLoadingResults(false) }
    catch { setIsLoadingResults(null) }
  }
  
  async function onLoadMore() {
    setIsLoadingResults(true)
      try {
        const url = urlFromSearchQuery({ ...refsqp.current.sq, page: refsqp.current.p + 50})
        const nsr = await fetchjson(url)
        refsqp.current.p += 50
        setSR({ searchResults: sr.searchResults.concat(nsr.searchResults), endOfSearch: nsr.endOfSearch })
        setIsLoadingResults(false) }
      catch { setIsLoadingResults(null) }
  }

  return <ul className='tl f1 h100'>{props.isLib ? trTL.map(t => <li key={t.id}><TorrentFileItem rm={true} t={t} big={false} onClick={() => props.onSelectTorrentId(t.id)} /><hr /></li>) : [
        <SearchBar onSubmit={onSearch} />].concat(sr?.searchResults.map(tf => <li key={tf.tid}>
        <TorrentFileItem rm={false} tf={tf} big={false} onClick={() => props.onSelectTorrent(tf)} />
        <hr />
      </li>)).concat(isLoadingResults !== false ? [<li className='plusbutton fr'>
      {isLoadingResults === true ? <PropagateLoader color='mediumturquoise'/> : <Icon path={mdiClose} color='tomato' />}
    </li>] : []).concat(isLoadingResults || (sr?.endOfSearch ?? true) ? [] : [<button onClick={onLoadMore} className='plusbutton fr'><Icon className='icon' path={mdiPlus} color='dodgerblue' /></button>])}
  </ul>
}