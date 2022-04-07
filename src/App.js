import React, { Component } from "react"
import "./css/App.css"
import investor from "./img/investors.svg"
import board from "./img/board.png"
import {
  Container,
  Icon,
  Label,
  Input,
  Button,
  Header,
  Form,
  Message,
  Statistic,
  Table,
  Modal,
  Segment,
  Image,
} from "semantic-ui-react"

var crypto = require("crypto")

var currentTimeHash = crypto
  .createHash("sha256")
  .update(`${Date.now()}`)
  .digest("hex")

class App extends Component {
  handleChange(event) {
    this.setState({ seed: event.target.value })
  }

  updateMultiplier(event) {
    var pct = 100 / event.target.value
    var odds = pct

    this.setState({
      multiplier: event.target.value,
      target: ((odds / 100) * 1100).toFixed(1),
    })
  }

  updateBet(event) {
    this.setState({ bet: event.target.value })
  }

  randomizeSeed() {
    this.setState({
      seed: crypto.createHash("sha256").update(`${Date.now()}`).digest("hex"),
    })
  }

  handleBet() {
    //clear error state
    this.setState({ errorMessage: "" })

    //first, check if bet is less than zero
    if (this.state.bet < 0) {
      this.setState({ errorMessage: "bet can't be less than zero" })
    } else if (isNaN(this.state.bet)) {
      this.setState({ errorMessage: "bet is not a number" })
    } else if (this.state.balance - this.state.bet < 0) {
      this.setState({ errorMessage: "insufficient balance!" })
    } else {
      //good to bet now

      //first deduct bet from balance
      var bet = this.state.bet
      var balance = this.state.balance - bet

      var timestamp = Date.now()
      var nonce = (Math.random() * 11000).toFixed(0)

      //first hash seed + current time + math.random
      var resultHash = crypto
        .createHash("sha256")
        .update(this.state.seed + "_" + timestamp + "_" + nonce)
        .digest("hex")

      //take first 10 bits of result hash
      resultHash = resultHash.substring(0, 10)

      //convert 10 hex bits to decimal
      var result = parseInt(resultHash, 16)

      //take decimal mod 10,001
      result = result % 1100
      var resultFormart = (
        result == 0
          ? "0000"
          : (result < 10
              ? "000"
              : result < 100
              ? "00"
              : result < 1000
              ? "0"
              : "") + result.toString()
      ).split("")
      if (result < this.state.target) {
        //win
        this.setState({
          resultColor: "green",
          lastRoll: resultFormart,
          lastTarget: this.state.target,
          balance: balance + bet * this.state.multiplier,
        })

        this.state.betHistory.push({
          result: result,
          bet: bet,
          target: this.state.target,
          winnings: `$${parseFloat(bet * this.state.multiplier).toFixed(2)}`,
          timestamp: timestamp,
          seed: this.state.seed,
          nonce: nonce,
        })

        //clean up array after 20 bets (to preserve memory)
        if (this.state.betHistory.length > 20) {
          this.setState({ betHistory: this.state.betHistory.slice(1) })
        }
      } else {
        //loss
        this.setState({
          resultColor: "red",
          lastRoll: resultFormart,
          lastTarget: this.state.target,
          balance: balance,
        })

        this.state.betHistory.push({
          result: result,
          bet: bet,
          target: this.state.target,
          winnings: `-$${parseFloat(bet).toFixed(2)}`,
          timestamp: timestamp,
          seed: this.state.seed,
          nonce: nonce,
        })

        //clean up array after 20 bets (to preserve memory)
        if (this.state.betHistory.length > 20) {
          this.setState({ betHistory: this.state.betHistory.slice(1) })
        }
      }
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      balance: 1000.0,
      multiplier: 2.0,
      target: 550,
      bet: 1,
      seed: currentTimeHash,
      errorMessage: "",
      lastRoll: ["0", "0", "0", "0"],
      lastTarget: "550",
      resultColor: "grey",
      betHistory: [],
    }

    this.handleChange = this.handleChange.bind(this)
    this.randomizeSeed = this.randomizeSeed.bind(this)
    this.updateMultiplier = this.updateMultiplier.bind(this)
    this.updateBet = this.updateBet.bind(this)
  }

  render() {
    return (
      <div className="App">
        <Container>
          <header className="App-header">
            {/* <img src={logo} className="App-logo" alt="logo" /> */}
            <h1 className="App-title">Crime Casino</h1>
          </header>
          <div className="App-body">
            <div className="App-mainbody">
              <div className="current-status">
                <div className="sparkle">
                  {this.state.balance.toFixed(2)} SOL
                </div>
              </div>
              <Input
                action={
                  <Button
                    color="teal"
                    icon="random"
                    content="randomize seed"
                    onClick={this.randomizeSeed}
                  />
                }
                value={this.state.seed}
                onChange={this.handleChange}
                placeholder="seed"
                style={{ marginTop: "10px", display: "none" }}
                fluid
              />

              <Statistic color={this.state.resultColor}>
                <div className="target-less">
                  Target: {this.state.lastTarget}
                  <Icon>
                    <i className="angle left icon"></i>
                  </Icon>
                </div>
                <div className="board">
                  <Image src={board} className="board-img" />
                  <Statistic.Value className="board-result">
                    {this.state.lastRoll.map((val, idx) => (
                      <div key={idx}>{val}</div>
                    ))}
                  </Statistic.Value>
                </div>
              </Statistic>

              <div className="btn-group">
                <Button size="large" color="red">
                  Low
                </Button>
                <Button
                  onClick={() => this.handleBet()}
                  size="massive"
                  color="teal"
                >
                  BET
                </Button>
                <Button size="large" color="green">
                  High
                </Button>
              </div>
              {/* <Header as="h2">Bet</Header> */}
              <div className="input-group">
                <div className="flex-direction">
                  <h3> BET AMOUNT</h3>
                  <div className="times-btns">
                    <Input
                      value={this.state.bet}
                      onChange={this.updateBet}
                      label="SOL"
                      labelPosition="left"
                      placeholder="your bet"
                    />
                    <Button
                      onClick={() => this.setState({ bet: this.state.bet / 2 })}
                      size="large"
                      color="red"
                      className="times-btn"
                    >
                      1/2
                    </Button>
                    <Button
                      onClick={() => this.setState({ bet: this.state.bet * 2 })}
                      size="large"
                      color="green"
                      className="times-btn"
                    >
                      2X
                    </Button>
                  </div>
                </div>
                <Form>
                  <Form.Field inline>
                    <div className="flex-direction">
                      <h3> PROFIT ON WIN</h3>
                      <Input
                        value={(this.state.multiplier - 1) * this.state.bet}
                        onChange={this.updateMultiplier}
                        label="SOL"
                        labelPosition="left"
                        placeholder="multiplier"
                      />
                    </div>
                    <div className="flex-direction">
                      <h3> ODDS</h3>
                      <Input
                        value={this.state.multiplier}
                        onChange={this.updateMultiplier}
                        label="x"
                        labelPosition="left"
                        placeholder="multiplier"
                      />
                    </div>
                    <div className="flex-direction">
                      <h3> CHANCE</h3>
                      <Input
                        value={(100 / (1100 / this.state.target)).toFixed(1)}
                        label="%"
                        labelPosition="left"
                        placeholder="Percentage"
                      />
                    </div>

                    {/* <Label pointing="left" size="large">
                      {(100 / (1100 / this.state.target)).toFixed(1)} %
                    </Label> */}
                  </Form.Field>
                </Form>
              </div>

              {this.state.errorMessage && (
                <Message negative>
                  <Message.Header>Error</Message.Header>
                  <p>{this.state.errorMessage}</p>
                </Message>
              )}
            </div>
            <div className="App-investors">
              <Image src={investor} />
            </div>
          </div>
          <div className="history">
            <Header as="h2">History</Header>
            <div className="history-table">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Amount</Table.HeaderCell>
                    <Table.HeaderCell>Under Target</Table.HeaderCell>
                    <Table.HeaderCell>Roll</Table.HeaderCell>
                    <Table.HeaderCell>Winnings</Table.HeaderCell>
                    {/* <Table.HeaderCell>Provably-fair</Table.HeaderCell> */}
                  </Table.Row>
                </Table.Header>
                {this.state.betHistory
                  .slice(0)
                  .reverse()
                  .map(function (bet, index) {
                    return (
                      <Table.Body>
                        <Table.Row
                          positive={bet.result < bet.target}
                          negative={bet.result >= bet.target}
                        >
                          <Table.Cell>
                            ${parseFloat(bet.bet).toFixed(2)}
                          </Table.Cell>
                          <Table.Cell>{bet.target}</Table.Cell>
                          <Table.Cell>{bet.result}</Table.Cell>
                          <Table.Cell>{bet.winnings}</Table.Cell>
                          {/* <Table.Cell>
                        <Modal trigger={<Button>verify</Button>} closeIcon>
                          <Header
                            icon="heart"
                            content="Provably-Fair Verification"
                          />
                          <Modal.Content scrolling>
                            <Header as="h3">Seed</Header>
                            <Segment compact inverted>
                              {bet.seed}
                            </Segment>
                            <Header as="h3">Timestamp</Header>
                            <Segment compact inverted>
                              {bet.timestamp}
                            </Segment>
                            <Header as="h3">Nonce</Header>
                            <Segment compact inverted>
                              {bet.nonce}
                            </Segment>
                            <Header as="h3">Game seed</Header>
                            <Segment compact inverted>
                              {bet.seed + "_" + bet.timestamp + "_" + bet.nonce}
                            </Segment>
                            <Header as="h3">Game hash (sha256)</Header>
                            <Segment compact inverted>
                              {crypto
                                .createHash("sha256")
                                .update(
                                  bet.seed +
                                    "_" +
                                    bet.timestamp +
                                    "_" +
                                    bet.nonce
                                )
                                .digest("hex")}
                            </Segment>
                            <Header as="h3">
                              Result hex (first 10 bytes of above hash)
                            </Header>
                            <Segment compact inverted>
                              {crypto
                                .createHash("sha256")
                                .update(
                                  bet.seed +
                                    "_" +
                                    bet.timestamp +
                                    "_" +
                                    bet.nonce
                                )
                                .digest("hex")
                                .substring(0, 10)}
                            </Segment>
                            <Header as="h3">Above hex, parsed to int</Header>
                            <Segment compact inverted>
                              {parseInt(
                                crypto
                                  .createHash("sha256")
                                  .update(
                                    bet.seed +
                                      "_" +
                                      bet.timestamp +
                                      "_" +
                                      bet.nonce
                                  )
                                  .digest("hex")
                                  .substring(0, 10),
                                16
                              )}
                            </Segment>
                            <Header as="h3">
                              Above int mod 10,001 (gives us random result
                              between 0-10,000)
                            </Header>
                            <Segment compact inverted>
                              {parseInt(
                                crypto
                                  .createHash("sha256")
                                  .update(
                                    bet.seed +
                                      "_" +
                                      bet.timestamp +
                                      "_" +
                                      bet.nonce
                                  )
                                  .digest("hex")
                                  .substring(0, 10),
                                16
                              ) % 10001}
                            </Segment>
                          </Modal.Content>
                        </Modal>
                      </Table.Cell> */}
                        </Table.Row>
                      </Table.Body>
                    )
                  })}
              </Table>
            </div>
          </div>
        </Container>
      </div>
    )
  }
}

export default App
