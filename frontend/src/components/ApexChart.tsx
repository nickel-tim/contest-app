import React from 'react';
import ReactApexChart from 'react-apexcharts';

class ApexChart extends React.Component {
    render() {
      const { options, series } = this.props;
  
      return (
        <div id="chart">
          <ReactApexChart options={options} series={series} type="bar" height={380} />
        </div>
      );
    }
  }

export { ApexChart };
