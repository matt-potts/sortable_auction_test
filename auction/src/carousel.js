import React, { Component } from 'react';
import { observer } from "mobx-react"
import { decorate } from 'mobx'
import PropTypes from 'prop-types';
import { Carousel } from 'react-bootstrap';

const AuctionCarousel = observer(class AuctionCarousel extends Component {
    static propTypes = {
        items: PropTypes.arrayOf(PropTypes.shape({
          bidder: PropTypes.string,
          bid: PropTypes.number,
          site: PropTypes.string,
          unit: PropTypes.string
        })).isRequired
    };

    render() {
      return <>
        <Carousel>
          {
            this.props.items.map((item, index) => {
              return <Carousel.Item>
                <div className="winner" key={index}>
                  <p><b>Site:</b> {item.site}</p>
                  <p><b>Bidder:</b> {item.bidder}</p>
                  <p><b>Bid Amount:</b> ${item.bid.toFixed(2)}</p>
                  <p><b>Unit Purchased:</b> {item.unit}</p>
                </div>
              </Carousel.Item>;
            })
          }
        </Carousel>
      </>;
    }
});

decorate(AuctionCarousel, {

});

export default AuctionCarousel;
