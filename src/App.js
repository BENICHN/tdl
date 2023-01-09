import TorrentList from "./components/TorrentList"
import TorrentInfos from "./components/TorrentInfos"
import { useState } from "react"
import StatusBar from "./components/StatusBar"
import { TransmissionProvider } from "./transmission-context"

export default function App(props) {
  const [tf, setTF] = useState();
  const [id, setId] = useState();
  const [isLib, setIsLib] = useState(false);

  return <div id='approot' className='fr oh'>
    <TransmissionProvider>
      <div className='f1 fc oh'>
        <StatusBar onSetIsLib={() => setIsLib(!isLib)} />
        <TorrentList isLib={isLib} onSelectTorrent={async tf => {
          setId(undefined)
          setTF(tf)
        }} onSelectTorrentId={async id => {
          setTF(undefined)
          setId(id)
        }} />
      </div>
      <div className='f1 oh'><TorrentInfos id={id} tf={tf} /></div>
    </TransmissionProvider>
  </div>
}
