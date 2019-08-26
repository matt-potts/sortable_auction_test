import React, { Component } from 'react';
import { observer } from "mobx-react"
import PropTypes from 'prop-types';
import { Carousel } from 'react-bootstrap';

// This carousel is used to display auction results with the winners being cycled through as slides.
// chevrons from Font Awesome Free 5.2.0 by @fontawesome - https://fontawesome.com [CC BY 4.0 (https://creativecommons.org/licenses/by/4.0)]
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
        <Carousel indicators={false}>
          {
            this.props.items.map((item, index) => {
              return <Carousel.Item key={index}>
                <div className="winner">
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

export default AuctionCarousel;
