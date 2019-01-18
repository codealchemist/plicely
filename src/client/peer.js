import SimplePeer from 'simple-peer'
import signalhub from 'signalhub'
import Clipboard from 'clipboard'
import nanoid from 'nanoid'

class Peer {
  constructor () {
    this.baseUrl = `${window.location.protocol}//${window.location.host}`
    this.id = nanoid(12)
    this.initiatorId = this.getInitiatorId()
    this.isInitiator = !this.initiatorId
    this.onErrorCallback = null

    // Set sharing URL only when not connecting to an initiator.
    // The initiator creates sharing.
    if (this.isInitiator) this.setSharingUrl()

    this.initSignaling()
    this.initPeer()
    this.connectedPeers = []
  }

  initPeer () {
    console.log('init peer')
    this.peer = new SimplePeer({
      initiator: this.isInitiator,
      trickle: false
    })
    this.setPeerEvents()
  }

  setSharingUrl () {
    const $copy = document.getElementById('copy')
    $copy.style.display = 'block'
    const shareUrl = `${this.baseUrl}#${this.id}`
    console.log(shareUrl)
    new Clipboard('#copy', {
      text: () => shareUrl
    })
  }

  setPeerEvents () {
    console.log('set peer events')
    this.peer.on('error', err => {
      console.log('error', err)
      if (typeof this.onErrorCallback === 'function') {
        this.onErrorCallback(err)
      }
    })

    this.peer.on('close', err => {
      console.log('close', err)
      this.reconnect()
    })

    this.peer.on('signal', signal => {
      console.log('SIGNAL', JSON.stringify(signal))
      this.signal = signal
      this.hub.broadcast(this.channelName, { signal, id: this.id })
    })

    this.peer.on('connect', () => {
      console.log('CONNECT')
    })

    this.peer.on('data', data => {
      console.log('data: ' + data)
      if (typeof this.onDataCallback === 'function') {
        this.onDataCallback(data)
      }
    })

    window.peer = this.peer
  }

  initSignaling () {
    console.log('PEER ID', this.id)
    console.log('INITIATOR ID:', this.initiatorId)
    this.channelName = this.initiatorId || this.id
    console.log('CHANNEL', this.channelName)
    this.hub = signalhub('plicely', ['https://plicely-signalhub.herokuapp.com'])
    this.hub
      .subscribe(this.channelName)
      .on('data', message => this.onSignalMessage(message))

    // If not the initiator, request offer to initiator.
    if (!this.isInitiator) {
      console.log('Signaling: SEND REQUEST MSG')
      this.hub.broadcast(this.channelName, { id: this.id, type: 'request' })
    }
  }

  onSignalMessage (message) {
    console.log('new message received', message)
    const { signal, id, type } = message || {}

    // Ignore own messages.
    if (id === this.id) return

    // Only the initiator will answer with offers to other peers.
    // Send offer using signalling channel.
    if (this.isInitiator && type === 'request') {
      this.hub.broadcast(this.channelName, {
        id: this.id,
        type: 'offer',
        signal: this.signal
      })
      return
    }

    // Only normal peers will use signalling data from the initiator.
    if (!this.isInitiator && type === 'request') return
    if (!signal) return
    this.peer.signal(signal)
  }

  getInitiatorId () {
    const hash = window.location.hash.substr(1)
    return hash
  }

  reconnect () {
    console.log('RECONNECT')
    this.destroy()
    this.initPeer()
  }

  onError (callback) {
    this.onErrorCallback = callback
    return this
  }

  onData (callback) {
    this.onDataCallback = callback
    return this
  }

  send (data) {
    if (!this.peer.connected) return
    const message = JSON.stringify({ payload: data })
    console.log('Peer SEND', message)
    this.peer.send(message)
  }

  destroy () {
    this.peer.destroy()
  }
}

const peer = new Peer()
export default peer
