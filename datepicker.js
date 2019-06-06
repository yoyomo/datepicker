const m = (nodeName, attributes, ...args) => {
  let children = args.length ? [].concat(...args) : null;
  return {
    nodeName,
    attributes,
    children
  }
};

const render = (vnode) => {
  if (vnode.split) return document.createTextNode(vnode);
  let n = document.createElement(vnode.nodeName);
  let as = vnode.attributes || {};
  for (let k in as) {
    if (typeof as[k] === "function") {
      n[k] = as[k];
    } else {
      n.setAttribute(k, as[k]);
    }
  }
  (vnode.children || []).map(c => n.appendChild(render(c)));
  return n;
};

const renderAt = (vnode, query) => {
  let elements = document.querySelectorAll(query);
  elements.forEach(element => {
    element.innerHTML = render(vnode);
  });
};


window.onload = () => {

  class DatePicker  {

    showingCalendar;
    today;
    date;
    weeksInTheMonth;
    maxDays;
    input;
    chosenDate;

    constructor(props) {
      this.props = props;
      this.handleInput = this.handleInput.bind(this);
      this.handleSelectDate = this.handleSelectDate.bind(this);
      this.openCalendar = this.openCalendar.bind(this);
      this.closeCalendar = this.closeCalendar.bind(this);

      this.today = new Date();
      this.date = this.props.value || new Date(this.today.getTime());
      this.chosenDate = this.props.value;
      this.setInputValue();
      this.recalculateDaysInTheMonth();
    }

    recalculateDaysInTheMonth = () => {
      this.maxDays = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
      this.weeksInTheMonth = [];

      let tmpDay = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
      let firstDayOfTheWeek = tmpDay.getDay();
      tmpDay.setDate(tmpDay.getDate() - firstDayOfTheWeek - 1);

      let weekInTheMonth = 0;
      for (let i = 0; i < 42; i++) {
        tmpDay.setDate(tmpDay.getDate() + 1);
        let dayInTheWeek = i % 7;
        weekInTheMonth = (i / 7 | 0) === weekInTheMonth + 1 ? weekInTheMonth + 1 : weekInTheMonth;
        if (weekInTheMonth === 5 && dayInTheWeek === 0 && tmpDay.getDate() < 10) {
          break;
        }
        this.weeksInTheMonth[weekInTheMonth] = this.weeksInTheMonth[weekInTheMonth] || [];
        this.weeksInTheMonth[weekInTheMonth][dayInTheWeek] = new Date(tmpDay.getTime());
      }
    };

    setInputValue = () => {
      this.input.value = this.chosenDate && `${this.chosenDate.getFullYear()}/${this.chosenDate.getMonth() + 1}/${this.chosenDate.getDate()}`;
    };

    openCalendar = (e) => {
      e.preventDefault();
      this.showingCalendar = true;
    };

    closeCalendar = (e) => {
      e.preventDefault();
      this.showingCalendar = false;
    };

    previousMonth = () => {
      this.date.setMonth(this.date.getMonth() - 1);
      this.recalculateDaysInTheMonth();
    };

    nextMonth = () => {
      this.date.setMonth(this.date.getMonth() + 1);
      this.recalculateDaysInTheMonth();
    };

    handleSelectDate = (date) => {
      this.date = new Date(date.getTime());
      this.chosenDate = new Date(date.getTime());
      this.setInputValue();
      this.recalculateDaysInTheMonth();

      this.props.onChange(date);

    };

    handleInput = () => {
      let d = this.input.value.split('/');
      let year = parseInt(d[0]);
      let month = parseInt(d[1]);
      let day = parseInt(d[2]);

      if (year && month && day) {
        let date = new Date();
        date.setFullYear(year);
        date.setMonth(month - 1);
        date.setDate(day);
        this.handleSelectDate(date);
      }
    };


    render = () => {
      render(
        m('div', {tabindex: -1, onfocus: this.openCalendar, onblur: this.closeCalendar},
          m('input',{
            class: this.props.class,
            ref: (r) => this.input = r,
            onchange: this.handleInput,
            placeholder: this.props.placeholder || 'YYYY/MM/DD'})
          )
      );

      return "<div tabIndex={-1}\
      onFocus={this.openCalendar} onBlur={this.closeCalendar}>\
        <input className={this.props.className}\
      ref={(r) => this.input = r}\
      onChange={this.handleInput}\
      placeholder={this.props.placeholderText || 'YYYY/MM/DD'}/>\
      {this.showingCalendar &&\
      <div className={'absolute tc bg-white z-999 shadow-1 br1'}>\
        <div className={'pa3 bg-light-gray dark-gray h-30'}>\
        <div className={'db'}>\
        <div className='dib pointer fl fill-gray' onClick={this.previousMonth}>\
        <SVGArrow width={10} height={10} className={'dib rotate-90'}/>\
      </div>\
      <div className='dib f5'>\
        {i18n.monthInTheYear[this.props.language][this.date.getMonth()] + ' ' + this.date.getFullYear()}\
        </div>\
        <div className='dib pointer fr fill-gray' onClick={this.nextMonth}>\
        <SVGArrow width={10} height={10} className={'dib rotate-270'}/>\
      </div>\
      </div>\
      <div className={'db pt2'}>\
        <Row>\
        {i18n.daysOfTheWeek[this.props.language].map((dayOfTheWeek ,i)=> {\
            return <Column key={'day-of-the-week-' + i} className={'ma pa2 br'}>{dayOfTheWeek}</Column>\
          })}\
        </Row>\
        </div>\
        </div>\
        <table className={'w-100 pa3'}>\
        <tbody className={'flex flex-column'}>\
        {this.weeksInTheMonth.map((weekInTheMonth, weekIndex) => {\
            return <tr className={'w-100 flex flex-row '} key={'week-' + weekIndex}>\
              {weekInTheMonth.map((dayInTheWeek, dayIndex) => {\
                  let dateNumber = dayInTheWeek.getDate();\
                  let colorClasses = 'hover-bg-light-blue hover-white';\
                  if (this.today.toLocaleDateString() === dayInTheWeek.toLocaleDateString()) {\
                    colorClasses += ' bg-light-gray';\
                  }\
                  if (this.chosenDate && this.chosenDate.toLocaleDateString() === dayInTheWeek.toLocaleDateString()) {\
                    colorClasses = ' bg-blue white';\
                  }\
                  return <td key={'week-' + weekIndex + '-day-' + dayIndex}\
                  onClick={() => this.handleSelectDate(dayInTheWeek)}\
                  className={`pa2 ma pointer br2\
                           ${colorClasses}\
                  ${(weekIndex === 0 && dateNumber > 20) || (weekIndex === this.weeksInTheMonth.length - 1 && dateNumber < 10) ? 'gray' : ''}`}>\
                  {dateNumber < 10 ? '0' : ''}{dateNumber}\
                </td>\
                })}\
              </tr>\
          })\
        }\
        </tbody>\
        </table>\
        </div>\
      }\
    </div>\
    "
    }
  }

  let dateInputs = document.querySelectorAll('input#date');
  dateInputs.forEach(dateInput => {
    let input = new DatePicker();
    dateInput.innerText = input.render();
  });
};

