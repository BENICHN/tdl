import { FiChevronUp, FiChevronDown, FiCircle, FiUsers } from 'react-icons/fi'
import { stringFromDate, stringFromTime } from "../utils"

export default function Tracker(props) {
    const tr = props.tr
    const dn = Date.now()
    return <div className='tracker' >
        <div className='host' >(T{tr.tier}) {tr.host}</div>
        <div className={'sas ' /* + (tr.announceState !== 0 ? '' : 'err') */} >{tr.announceState === 2 ? 'Annonce en cours...' : tr.hasAnnounced ? 'Dernière annonce ' + stringFromDate(tr.lastAnnounceStartTime * 1000) + (tr.lastAnnounceTimedOut ? 'a expiré' : ' a renvoyé "' + tr.lastAnnounceResult + '" en ' + stringFromTime((tr.lastAnnounceTime - tr.lastAnnounceStartTime) * 1000)) : 'Pas encore annoncé'}</div>
        <div className='' >{tr.nextAnnounceTime * 1000 - dn <= 0 ? "Pas d'annonce prévue" : 'Prochaine annonce dans ' + stringFromTime(tr.nextAnnounceTime * 1000 - dn) + ' (' + stringFromDate(tr.nextAnnounceTime * 1000) + ')'}</div>
        <div className={'sas ' /* + (tr.scrapeState !== 0 ? '' : 'err') */} >{tr.scrapeState === 2 ? 'Scrape en cours...' : tr.hasScraped ? 'Dernier scrape ' + stringFromDate(tr.lastScrapeStartTime * 1000) + (tr.lastScrapeTimedOut ? 'a expiré' : ' a renvoyé "' + tr.lastScrapeResult + '" en ' + stringFromTime((tr.lastScrapeTime - tr.lastScrapeStartTime) * 1000)) : 'Pas encore scrapé'}</div>
        <div className='' >{tr.nextScrapeTime * 1000 - dn <= 0 ? 'Pas de scrape prévu' : 'Prochain scrape dans ' + stringFromTime(tr.nextScrapeTime * 1000 - dn) + ' (' + stringFromDate(tr.nextAnnounceTime * 1000) + ')'}</div>
        <div className='sas fr ca'>
            <div className='f1' />
            <div className='trackerslcp fr ca' >
                <FiUsers className='icon' />
                {tr.lastAnnouncePeerCount}
            </div>
            <div className='trackerslcp fr ca seed' >
                <FiChevronUp className='icon' />
                {tr.seederCount}
            </div>
            <div className='trackerslcp fr ca leech' >
                <FiChevronDown className='icon' />
                {tr.leecherCount}
            </div>
            <div className='trackerslcp fr ca compl' >
                <FiCircle className='icon' />
                {tr.downloadCount}
            </div>
        </div>
    </div>
}