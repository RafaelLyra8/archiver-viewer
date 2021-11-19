import Browser from "../../utility/Browser";
import control from "../../entities/Chart";
import PlotPVs from "../../use-cases/PlotPVs";

interface UrlLoader {
  load(): Promise<void>;
}

const GetDelta = (hour = 12, min = 0, s = 0) => {
  const d1 = new Date();
  const d2 = new Date();
  d1.setHours(0, 0, 0);
  d2.setHours(hour, min, s);
  return new Date(d2.valueOf() - d1.valueOf());
};

const DATE_DELTA_1H = GetDelta(1);

class UrlLoaderImpl implements UrlLoader {
  async load(): Promise<void> {
    const { pvs, from, to } = Browser.getConfigFromUrl();
    const timespan = { from, to };

    const UpdateStartEndTimeFromUrl = () => {
      if (from && !to) {
        timespan.to = new Date(from.valueOf() + DATE_DELTA_1H.valueOf());
      } else if (!from && to) {
        timespan.from = new Date(to.valueOf() - DATE_DELTA_1H.valueOf());
      }

      control.setEnd(timespan.to);
      control.setStart(timespan.from);

      control.updateTimeWindowOnly(control.getNewTimeWindow());
    };

    if (!from && !to) {
      await control.updateStartAndEnd(new Date());
    } else {
      UpdateStartEndTimeFromUrl();
    }

    control.updateTimeAxis();
    for (const data of pvs) {
      console.info(`Plotting `, data);
      PlotPVs.plotPV({ name: data.pvname, optimize: data.optimize, bins: data.bins, updateChart: true });
    }
  }
}

const urlLoader: UrlLoader = new UrlLoaderImpl();

export default urlLoader;
