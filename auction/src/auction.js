import React, { Component } from 'react';
import Uploader from "./uploader";
import { observer } from "mobx-react"
import { action, computed, decorate, observable } from "mobx"

// This component runs an auction. It takes a config and auction data, uploaded by the user, and returns
// winners from the auction in a json format.
// Still to do: adjustment factoring, validations
// nice to haves for later: flashier UI, Node API support
const Auction = observer(class Auction extends Component {
  configJson;
  auctionJson;
  showConfigData = false;
  auctionResults;

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
      return <div className="m-4">
        <div className="d-flex mt-3">
          <div className="mr-3">
            <p>Upload Config file: </p>
            <Uploader saveFileContent={this.saveConfigContent} />
          </div>
          <div className="mr-3">
            <p>Upload Auction Data file: </p>
            <Uploader saveFileContent={this.saveAuctionContent} />
          </div>
        </div>
        <div className="mt-3">
          <button className="btn btn-primary" onClick={this.runAuction}>Run Auction</button>
        </div>

          {
            this.auctionResults && <div>
              <p>Auction Results</p>
              {this.auctionResults}
            </div>
          }

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
      this.configJson = newConfig;
    }

    saveAuctionContent(newAuctionContent) {
      this.auctionJson = newAuctionContent;
    }

    // The meat and potatoes of the component. This runs the auctions, collects winners, and
    // formats everything into a json format.
    runAuction() {
      let results = [];
      const approvedBidders = this.bidderList.map((bidder) => bidder.name);
      const approvedSites = this.siteList.map((site) => site.name);

      // convert json object to array, then iterate
      results = this.auctionJson.slice().map((auction) => {
        const currentBids = auction.bids.slice();
        const site = auction.site;
        const currentUnits = auction.units.slice();
        const winningUnitBids = {};
        const finalWinners = [];

        if (approvedSites.includes(site)) {
          currentBids.forEach((currentBid) => {
            const { bid, bidder, unit } = currentBid;

            if (approvedBidders.includes(bidder)) {
              if (currentUnits.includes(unit)) {
                const winningUnitBid = winningUnitBids[unit];

                // an existing bid for this unit
                if (!!winningUnitBid) {
                  // new winning bid. Save info.
                  if (bid > winningUnitBid.bidAmount) {
                    winningUnitBids[unit] = {
                      bidder: bidder,
                      bidAmount: bid
                    };
                  }
                } else {
                  // save first bid
                  winningUnitBids[unit] = {
                    bidder: bidder,
                    bidAmount: bid
                  };
                }
              }
            }
          });

          // construct the desired output from the winning bids
          for (const key in winningUnitBids) {
            const bid = winningUnitBids[key];
            finalWinners.push({
              bidder: bid.bidder,
              bid: bid.bidAmount,
              unit: key
            });
          }
        }

        return finalWinners;
      });

      this.auctionResults = JSON.stringify(results);
    }
});

decorate(Auction, {
  runAuction: action.bound,
  saveConfigContent: action.bound,
  saveAuctionContent: action.bound,
  bidderList: computed,
  siteList: computed,
  auctionJson: observable,
  auctionResults: observable,
  configJson: observable
});

export default Auction;
