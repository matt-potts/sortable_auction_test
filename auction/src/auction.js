import React, { Component } from 'react';
import Uploader from './uploader';
import Carousel from './carousel';
import { observer } from 'mobx-react'
import { action, computed, decorate, observable } from 'mobx'

// This component runs an auction. It takes a config and auction data, uploaded by the user, and returns
// winners from the auction in a json format.
// Still to do: adjustment factoring, validations
// nice to haves for later: flashier UI, Node API support
const Auction = observer(class Auction extends Component {
  configJson;
  auctionJson;
  showConfigData = false;
  auctionResults;
  auctionResultsRaw;
  showConfigUploader = true;
  showDataUploader = false;
  showAuctionStartButton = false;
  showRestartButton = false;
  activeError;

  get siteList() {
    let sites;

    if (!!this.configJson && !!this.configJson.sites) {
      sites = this.configJson.sites;
    }

    return sites;
  }

  get bidderList() {
    let bidders;

    if (!!this.configJson && !!this.configJson.bidders) {
      bidders = this.configJson.bidders;
    }

    return bidders;
  }

    render() {
      return <div className="h-100">
        <div className="d-flex flex-column h-100 justify-content-center align-items-center">
          <div className="text-center mb-4">
            <h1>The Auctionizer</h1>
            <h4>The world's 57th least mediocre auction checker</h4>
          </div>
          <div className="uploader">
            {
              this.activeError && <div>
                <p className="red">{this.activeError}</p>
              </div>
            }

            {
              this.showConfigUploader && <>
                <p>Upload your config file</p>
                <Uploader saveFileContent={this.saveConfigContent} />
              </>
            }

            {
              this.showDataUploader && <>
                <p>Upload your Auction Data file: </p>
                <Uploader saveFileContent={this.saveAuctionContent} />
              </>
            }

            {
              this.showAuctionStartButton && <button className="btn btn-primary btn-lg" onClick={this.runAuction}>Run Auction</button>
            }

            {
              this.showRestartButton && <button className="btn btn-primary btn-lg" onClick={this.restart}>Restart</button>
            }

            {
              this.auctionResults && <>
                <h4 className="my-4">Winning Bids</h4>
                <Carousel items={this.auctionResults} />
              </>
            }
          </div>
        </div>

        {
          this.showConfigData && <div>
            {
              !!this.siteList && <>
                <p>sites:</p>
                <ul>
                  {
                    this.siteList.map((site, index) => {
                      return <li key={index}>
                        <ul>
                          <li>Name: {site.name}</li>
                          <li>Approved Bidders: {site.bidders.join(', ')}</li>
                          <li>Floor: {site.floor}</li>
                        </ul>
                      </li>;
                    })
                  }
                </ul>
              </>
            }
            {
              !!this.bidderList && <>
                <p>bidders:</p>
                <ul>
                  {
                    this.bidderList.map((bidder, index) => {
                      return <li key={index}>
                        <ul>
                          <li>Name: {bidder.name}</li>
                          <li>Adjustment: {bidder.adjustment}</li>
                        </ul>
                      </li>;
                    })
                  }
                </ul>
              </>
            }
          </div>
        }
      </div>;
    }

    saveConfigContent(newConfig) {
      if (!!newConfig) {
        this.configJson = newConfig;
        this.showConfigUploader = false;
        this.showDataUploader = true;
      }
    }

    saveAuctionContent(newAuctionContent) {
      if (!!newAuctionContent) {
        this.auctionJson = newAuctionContent;
        this.showDataUploader = false;
        this.showAuctionStartButton = true;
      }
    }

    restart() {
      this.activeError = null;
      this.showDataUploader = false;
      this.showAuctionStartButton = false;
      this.showRestartButton = false;
      this.showConfigUploader = true;
      this.auctionResults = null;
    }

    // The meat and potatoes of the component. This runs the auctions, collects winners, and
    // formats everything into a json format.
    runAuction() {
      let results = [];
      let allAuctions;

      try {
        allAuctions = this.auctionJson.slice()
      } catch (e) {
        this.showError('There are no available auctions in your data file.');
        this.showAuctionStartButton = false;
        this.showRestartButton = true;
        return;
      }

      try {
        // convert json object to array, then iterate
        results = allAuctions.map((auction) => {
          const currentBids = auction.bids.slice();
          const site = auction.site;
          const currentUnits = auction.units.slice();
          const winningUnitBids = {};
          const finalWinners = [];

          // check auction for errors
          if (!currentBids.length) {
            throw new Error('There were no bids provided for the auction.');
          } else if (!currentUnits.length) {
            throw new Error('There are no listed units to bid on');
          } else if (!site) {
            throw new Error('There is no site listed for the current auction.');
          }

          if (!this.siteList && !this.bidderList) {
            throw new Error('The provided config file is corrputed.');
          }

          // if we have a result, the site is approved to entertain bids
          const approvedSite = this.siteList.find((currentSite) => {
            return currentSite.name === site;
          });

          if (!!approvedSite) {
            const minBidAmount = approvedSite.floor;

            currentBids.forEach((currentBid) => {
              // a bid looks something like this:
              // {
              //   "bidder": "AUCT",
              //   "unit": "sidebar",
              //   "bid": 55
              // }
              const { bid, bidder, unit } = currentBid;

              // if the bidder is found, they're approved to bid
              const approvedBidder = this.bidderList.find((currentBidder) => {
                return currentBidder.name === bidder;
              });

              if (!!approvedBidder) {
                // unit is available to bid on
                if (currentUnits.includes(unit)) {
                  const winningUnitBid = winningUnitBids[unit];

                  // make the adjustment
                  const adjustedBid = bid + approvedBidder.adjustment;

                  // they've met the floor requirements
                  if (adjustedBid > minBidAmount) {
                    // an existing bid for this unit
                    if (!!winningUnitBid) {
                      // this is a new winning bid. Overwrite info. Otherwise, do nothing.
                      if (adjustedBid > winningUnitBid.bidAmount) {
                        winningUnitBids[unit] = {
                          bidder: bidder,
                          bidAmount: adjustedBid
                        };
                      }
                    } else {
                      // save first bid
                      winningUnitBids[unit] = {
                        bidder: bidder,
                        bidAmount: adjustedBid
                      };
                    }
                  } else {
                    throw new Error(`The current bid of ${adjustedBid.toFixed(2)} from ${bidder} was under the floor.`);
                  }
                } else {
                  throw new Error(`The current unit, ${unit}, is not approved to bid on.`);
                }
              } else {
                throw new Error(`The current bidder, ${bidder}, is not approved.`);
              }
            });

            // construct the desired output from the winning bids
            for (const key in winningUnitBids) {
              const bid = winningUnitBids[key];

              finalWinners.push({
                bidder: bid.bidder,
                bid: bid.bidAmount,
                site: site,
                unit: key
              });
            }
          } else {
            throw new Error(`${site} is not an approved site.`);
          }

          return finalWinners;
        });

        if (!!results) {
          this.auctionResults = results[0];
          this.auctionResultsRaw = JSON.stringify(results);
        }
      } catch (e) {
        this.showError(e.message);
      }

      // fall through in either case and flip the flags
      this.showAuctionStartButton = false;
      this.showRestartButton = true;
    }

    showError(error) {
      this.showAuctionStartButton = false;
      this.showRestartButton = true;
      this.activeError = error;
    }
});

decorate(Auction, {
  restart: action.bound,
  runAuction: action.bound,
  saveConfigContent: action.bound,
  saveAuctionContent: action.bound,
  showError: action.bound,
  bidderList: computed,
  siteList: computed,
  auctionJson: observable,
  auctionResults: observable,
  auctionResultsRaw: observable,
  configJson: observable,
  showConfigUploader: observable,
  showDataUploader: observable,
  showAuctionStartButton: observable,
  showRestartButton: observable,
  showConfigData: observable
});

export default Auction;
