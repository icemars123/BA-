// *******************************************************************************************************************************************************************************************
// Modules used locally only...
var https = require('https');
var http = require('http');
var bunyan = require('bunyan');
var uuidv4 = require('uuid/v4');
var primus = require('primus');
var prrooms = require('primus-redis-rooms');
var pe = require('primus-emit');
var prop = require('properties');
var ekg = require('ekg');
var redis = require('redis');
var express = require('express');
var connect = require('connect');
var os = require('os-utils');
var cors = require('cors');
var multipart = require('connect-multiparty');
var cronjob = require('cron').CronJob;

// *******************************************************************************************************************************************************************************************
// Globally avail vars...
global.pg = require('pg');
global.pgtx = require('pg-transaction');
global.json3 = require('json3');
global.bignumber = require('decimal.js');
global.rsvp = require('rsvp');
global.moment = require('moment');
global.validator = require('validator');
global.httpget = require('simple-get');
global.concat = require('concat-stream');
global.mailer = require('nodemailer');
global.smtptransport = require('nodemailer-smtp-transport');
global.humanize = require('humanize');
global.deepcopy = require('deepcopy');
global.jssha = require('jssha');
global.hat = require('hat');
global.accounting = require('accounting');
global.async = require('async');
global.fs = require('fs');
global.path = require('path');
global.xlwriter = require('xlsx-template');
global.xlreader = require('node-xlsx');
global.oxr = require('open-exchange-rates');
global.fx = require('money');
global.diceware = require('diceware-password-generator');
global._geocoder = require('node-geocoder');
//
global.users = redis.createClient();
global.customers = redis.createClient();
global.rtaps = redis.createClient();

// *******************************************************************************************************************************************************************************************
// Our own modules... prefix with "mod" so we can tell...
global.modcounters = require('./modules/counters');
global.modauth = require('./modules/auth');
global.modaccounts = require('./modules/accounts');
global.modjournals = require('./modules/journals');
global.modclients = require('./modules/clients');
global.modsuppliers = require('./modules/suppliers');
global.modemployees = require('./modules/employees');
global.modlocations = require('./modules/locations');
global.modproducts = require('./modules/products');
global.modinventory = require('./modules/inventory');
global.modorders = require('./modules/orders');
global.modporders = require('./modules/porders');
global.modinvoices = require('./modules/invoices');
global.modmsg = require('./modules/msg');
global.modmdm = require('./modules/mdm');
global.modalerts = require('./modules/alerts');
global.modxr = require('./modules/xr');
global.modconfig = require('./modules/config');
global.modipad = require('./modules/ipad');
global.modhelpers = require('./modules/helpers');
global.modimport = require('./modules/import');
global.modprinting = require('./modules/printing');
global.modreports = require('./modules/reports');
global.modpayroll = require('./modules/payroll');
global.modscripts = require('./modules/scripts');
global.modpos = require('./modules/pos');
global.modgov = require('./modules/gov');
// Custom implementations
global.modtpcc = require('./modules/tpcc');

// *******************************************************************************************************************************************************************************************
// Reusable text...
global.eventerror = 'eventerror';
global.custchannelprefix = 'custchannel.';
//
global.text_performingquery = 'Performing query...';
global.text_success = 'Success...';
global.text_generalexception = 'General exception...';
global.text_dbexception = 'Database exception...';
global.text_invalidparams = 'Invalid params...';
global.text_missingparams = 'Missing params...';
global.text_nodbconnection = 'Unable to acquire db connection...';
global.text_notxstart = 'Unable to start transaction...';
global.text_notloggedin = 'Not logged in...';
global.text_sessionexpired = 'Session has expired...';
global.text_commsproblem = 'Comms problem...';
global.text_insertingrow = 'Inserting row...';
global.text_fileio = 'File I/O...';
global.text_tx = 'Transaction error...';
global.text_nodata = 'No data...';
global.text_invalidsession = 'Invalid session...';
global.text_invalidclient = 'Invalid client...';
global.text_unablerestoresession = 'Unable to restore session...';
global.text_invalidlogin = 'Invalid login...';
global.text_committx = 'Unable to committing transaction...';
global.text_unableparsejson = 'Unable to parse json string...';
global.text_emptyjson = 'Undefined, null or empty JSON string...';
global.text_unablestringifyjson = 'Undefined, null or empty object...';
global.text_userexists = 'User already exists...';
global.text_useralreadyregistered = 'User is already registered...';
global.text_usernotregistered = 'User is not registered...';
global.text_unablecreatenewuser = 'Unable to create new user...';
global.text_unableloginuser = "Unable to login user...";
global.text_unablesaveclient = "Unable to save client...";
global.text_unablesaveemployee = "Unable to save employee...";
global.text_unablenewlocation = "Unable to add new location...";
global.text_unablenewproduct = "Unable to add new product...";
global.text_unablesaveproductprice = "Unable to save product price...";
global.text_unablesaveproducttemplate = "Unable to save product template...";
global.text_unablesaveproducttemplatedetails = "Unable to save product template details...";
global.text_unablesaveprodcat = "Unable to save product category...";
global.text_unablesaveinventory = "Unable to save inventory...";
global.text_unablenewtaxcode = "Unable to add new tax code...";
global.text_unablesavetaxcode = "Unable to save tax code...";
global.text_unablenewaccount = "Unable to add new account...";
global.text_unablenewclient = "Unable to add new client...";
global.text_unableneworderdetail = "Unable to add new order product";
global.text_unableneworderstatus = "Unable to add new corder status...";
global.text_unablenewproductprice = "Unable to add new product price...";
global.text_unablenewproductcategory = "Unable to add new product category...";
global.text_unablenewproducttemplate = "Unable to add new product template...";
global.text_unablenewproducttemplatedetail = "Unable to add new product to template...";
global.text_unablenewbuildtemplatedetail = "Unable to add new product to build template...";
global.text_unablenewbuildttemplate = "Unable to add new build template...";
global.text_unablenewbuildtemplatedetail = "Unable to add new product to build template...";
global.text_unablenewbuildheader = "Unable to build inventory...";
global.text_unableneworder = "Unable to add new order...";
global.text_unablesavenotes = "Unable to save notes...";
global.text_unablegetuserauthdetails = "Unable to get user auth details...";
global.text_unablegetuseruuid = "Unable to get user\' uuid...";
global.text_unablegetidfromuuid = "Unable to get id from uuid...";
global.text_unabledeleteentry = "Unable to delete this entry...";
global.text_unablesaveorder = "Unable to save order...";
global.text_unablesaveorderdetail = "Unable to save order detail...";
global.text_unablegetorderversion = "Unable retrieve current order version...";
global.text_unablefetchorderdetail = "Unable to fetch order detail...";
global.text_unablefetchorderAttachment = "Unable to fetch order attachment...";
global.text_unablenextorderno = "Unable to fetch next order number...";
global.text_unablenextquoteno = "Unable to fetch next quote number...";
global.text_unablenextporderno = "Unable to fetch next purchase order number...";
global.text_unablenextjournalno = "Unable to fetch next journal number...";
global.text_unablenextclientno = "Unable to fetch next client number...";
global.text_unablenextsupplierno = "Unable to fetch next supplier number...";
global.text_unablenextempno = "Unable to fetch next employee number...";
global.text_unablenextjobsheetno = "Unable to fetch next job sheet number...";
global.text_unablenextbarcodeno = "Unable to fetch next barcode number...";
global.text_unableexpireprodcat = "Unable to expire product category...";
global.text_unableexpireproducttemplate = "Unable to expire product template...";
global.text_unableexpirebuildtemplate = "Unable to expire build template...";
global.text_unableexpireaccount = "Unable to expire account...";
global.text_unableexpirelocation = "Unable to expire location...";
global.text_unableexpireemployee = "Unable to expire employee...";
global.text_unableexpireclient = "Unable to expire client...";
global.text_unablenextinvoiceno = "Unable to fetch next invoice number...";
global.text_invalidfieldupdate = "Invalid field for update...";
global.text_invaliduser = "Invalid user or user not found...";
global.text_unableparseuser = "Unable to parse user info...";
global.text_unablegetbuildtemplateheader = "Unable to fetch build template definition...";
global.text_noordertemplate = "Unable to find an order template...";
global.text_noinvoicetemplate = "Unable to find an invoice template...";
global.text_noprinttemplate = "Unable to find system print template...";
global.text_nodeliverydockettemplate = "Unable to find a delivery docket template...";

//global.text_newcode = 'NEWCODE';
global.text_newcode = '';
global.text_newuid = 'userid';
global.text_nunablegetcommitstatuscode = 'Error retrieving commit status code...';
global.text_unablegetcustconfig = 'Unable to retrieve customer config...';
global.text_unableemail = 'Unable to send email...';
global.text_unableabnlookup = 'Unable to lookup ABN...';

// *******************************************************************************************************************************************************************************************
// Error codes
global.errcode_none = 0;
global.errcode_nodata = -1;
global.errcode_missingparams = -2;
global.errcode_fatal = -3;
global.errcode_notloggedin = -4;
global.errcode_sessionexpired = -5;
global.errcode_resourceunavail = -6;
global.errcode_dbunavail = -7;
global.errcode_userexists = -8;
global.errcode_dberr = -9;
global.errcode_fileerr = -10;
global.errcode_usernotregistered = -11;
global.errcode_passwdhash = -12;
global.errcode_invalidconnection = -13;
global.errcode_invalidlogin = -14;
global.errcode_missingurl = -15;
global.errcode_smserror = -16;
global.errcode_invalidsession = -17;
global.errcode_invalidclient = -18;
global.errcode_unablerestoresession = -19;
global.errcode_committx = -20;
global.errcode_jsonparse = -21;
global.errcode_jsonstringify = -22;
global.errcode_unablecreatenewuser = -23;
global.errcode_unableloginuser = -24;
global.errcode_unablesaveclient = -25;
global.errcode_unablesaveproduct = -26;
global.errcode_insufficientqty = -27;
global.errcode_invaliduser = -28;
global.errcode_unableoarseuser = -29;
global.errcode_unablegetcommitstatuscode = -30;
global.errcode_unablegetcustconfig = -31;

// *******************************************************************************************************************************************************************************************
// iTypes...
global.itype_inventory_xfer = 1;
global.itype_inventory_adjust = 2;
global.itype_inventory_order = 3;
global.itype_inventory_stock = 4;
global.itype_inventory_build = 5;
global.itype_inventory_porder = 6;

global.itype_journal_sales = 1;
global.itype_journal_purchases = 2;
global.itype_journal_payroll = 3;
global.itype_journal_cashreceipts = 4;
global.itype_journal_cashdisbursements = 5;
global.itype_journal_general = 6;
global.itype_journal_inventory_purchase = 7;
global.itype_journal_inventory_sale = 8;
global.itype_journal_adjustment = 99;

global.itype_account_asset = 1;
global.itype_account_expense = 2;
global.itype_account_liability = 3;
global.itype_account_equity = 4;
global.itype_account_income = 5;
global.itype_account_costofgoodssold = 6;
global.itype_account_otherincome = 7;
global.itype_account_otherexpenses = 8;
global.itype_account_bank = 99;

// Order statuses
global.itype_os_comment = 0;
global.itype_os_quote = 1;
global.itype_os_order = 2;
global.itype_os_invoiced = 3;
global.itype_os_poreceived = 4;
global.itype_os_depositpaid = 5;
global.itype_os_paid = 6;

global.itype_os_approved = 100;
global.itype_os_pending = 101;
global.itype_os_onhold = 102;
global.itype_os_completed = 103;
global.itype_os_backorder = 104;
global.itype_os_orderprocessed = 105;

global.itype_os_manufacturing = 200;
global.itype_os_picking = 201;
global.itype_os_readyfordespatch = 202;
global.itype_os_shipped = 203;

global.itype_os_artworkapproved = 300;
global.itype_os_platesordered = 301;
global.itype_os_platesreceived = 302;
global.itype_os_printing = 303;
global.itype_os_printingcompleteed = 304;
global.itype_os_cutting = 305;
global.itype_os_cuttingcompleted = 306;
global.itype_os_forming = 307;
global.itype_os_productbuilt = 308;
//
global.itype_os_jobsheet = 8000;

// Jobsheet detail statuses
global.itype_js_printer = 1;
global.itype_js_printer_complete = 2;
global.itype_js_cutter = 3;
global.itype_js_cutter_complete = 4;
global.itype_js_build = 5;
global.itype_js_build_complete = 6;

//
global.itype_pr_deposit = 1;
global.itype_pr_order = 2;
global.itype_pr_other = 99;
//
global.itype_bc_codabar = 0;
global.itype_bc_code11 = 1;
global.itype_bccode29 = 2;
global.itype_bc_code93 = 3;
global.itype_bc_code128 = 4;
global.itype_bc_ean8 = 5;
global.itype_bc_ean13 = 6;
global.itype_bc_std25 = 7;
global.itype_bcint25 = 8;
global.itype_bc_msi = 9;
global.itype_bc_datamatrix = 10;
//
global.itype_at_assets = 1;
global.itype_at_expenses = 1;
global.itype_at_liabilities = 1;
global.itype_at_equities = 1;
global.itype_at_revenues = 1;
global.itype_at_costgoodssold = 1;
global.itype_at_otherrevenue = 1;
global.itype_at_otherexpenses = 1;
//
global.itype_ims_chat = 1;
//
global.itype_employmentstatus_employed = 1;
global.itype_employmentstatus_suspended = 2;
global.itype_employmentstatus_onleave = 3;
//
global.itype_order_order = 1;
global.itype_order_invoice = 2;
global.itype_order_quote = 3;
global.itype_order_deliverydocket = 4;
//
global.itype_payfrequency_weekly = 1;
global.itype_payfrequency_fortnightly = 2;
global.itype_payfrequency_monthly = 3;
//
global.employmenttype_fulltime = 1;
global.employmenttype_parttime = 2;
global.employmenttype_casual = 3;
global.employmenttype_fixedterm = 4;
global.employmenttype_contract = 5;
global.employmenttype_apprentice = 6;
//
global.itype_taxtable_taxfreethreshold = 1;
global.itype_taxtable_notaxfreethreshold = 2;
//
global.itype_paymenttype_cc = 1;
global.itype_paymenttype_cheque = 2;
global.itype_paymenttype_eft = 3;
global.itype_paymenttype_cash = 4;
global.itype_paymenttype_other = 99;
//
global.itype_paymentreason_deposit = 1;
global.itype_paymentreason_order = 2;
global.itype_paymentreason_pos = 3;
global.itype_paymentreason_other = 99;
//
global.bignumber.config({precision: 10, rounding: global.bignumber.ROUND_HALF_UP});
//
global.transporter = null;
//
global.avatars = '';
//
global.tzoffset_server = global.moment().toDate().getTimezoneOffset();

// *******************************************************************************************************************************************************************************************
// Underscore stuff...
__ = require('underscore');
__.str = require('underscore.string');
__.mixin(__.str.exports());

__.mixin
(
  {
    serverToLocalTime: function(d, tzoffset_client)
    {
      var dt = moment(d);

      dt.add(global.tzoffset_server, 'minutes').subtract(tzoffset_client, 'minutes');

      return dt;
    }
  }
);

__.mixin
(
  {
    removeSpaces: function(s)
    {
      return s.replace(/ /g, '');
    }
  }
);

__.mixin
(
  {
    toType: function(obj)
    {
      return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }
  }
);

__.mixin
(
  {
    decodeURIFromPHP: function(u)
    {
      return decodeURIComponent((u + '').replace(/\+/g, '%20'));
    }
  }
);

__.mixin
(
  {
    // Using for/swap method - way way way faster than array.reverse on all browsers, especially Google V8...
    reverseArray: function(a)
    {
      var len = a.length;
      var left = null;
      var right = null;
      for (left = 0, right = len - 1; left < right; left += 1, right -= 1)
      {
        var t = a[left];
        a[left] = a[right];
        a[right] = t;
      }
      return a;
    }
  }
);

__.mixin
(
  {
    toBigNum: function(n)
    {
      if (__.isUNB(n) || isNaN(n) || (n == 0))
        return new global.bignumber(0.0);

      if (n instanceof global.bignumber)
        return n;

      return new global.bignumber(n);
    }
  }
);

__.mixin
(
  {
    sanitiseAsBool: function(b)
    {
      if (typeof b == 'string')
      {
        if ((b == 'true') || (b == '1'))
          return 1;
        return 0;
      }

      if (!__.isUNB(b) && !isNaN(b) && ((b == 1) || (b === true)))
        return 1;

      return 0;
    }
  }
);

__.mixin
(
  {
    sanitiseAsBigInt: function(n, nulliszero)
    {
      if (__.isUNB(n) || isNaN(n))
        return __.isUndefined(nulliszero) || (nulliszero == false) ? null : 0.0;

      if (isNaN(parseFloat(n)) || !isFinite(n))
        return __.isUndefined(nulliszero) || (nulliszero == false) ? null : 0.0;

      if (!(n instanceof global.bignumber))
        n = new global.bignumber(n);

      return n.toFixed(0);
    }
  }
);

__.mixin
(
  {
    sanitiseAsPrice: function(p, decimals)
    {
      var n = global.accounting.unformat(p);
      return __.formatnumber(n, decimals, false);
    }
  }
);

__.mixin
(
  {
    notNullNumeric: function(n, decimals)
    {
      if (__.isUNB(n) || isNaN(n))
        return 0.0000;

      var bn = new global.bignumber(n);
      return bn.toFixed(__.isUndefined(decimals) ? 4 : decimals);
    }
  }
);

__.mixin
(
  {
    formatuomsize: function(n)
    {
      if (__.isUNB(n) || isNaN(n) || (n == 0))
        return 1.0;

      var bn = new global.bignumber(n);
      return bn.toFixed(4);
    }
  }
);

__.mixin
(
  {
    formatnumber: function(n, decimals, zeroisnull)
    {
      if (__.isUNB(n) || isNaN(n) || (n == 0))
      {
        if (!__.isUndefined(zeroisnull) && (zeroisnull === true))
          return null;
        return 0.0;
      }

      var bn = new global.bignumber(n);
      return bn.toFixed(__.isUndefined(decimals) ? 4 : decimals);
    }
  }
);

__.mixin
(
  {
    niceformatnumber: function(n, decimals, zeroasblank)
    {
      if (__.isUNB(n) || isNaN(n) || (n == 0))
        return __.isUndefined(zeroasblank) || (zeroasblank == true) ? '' : 0.0;

      var d = __.isUndefined(decimals) ? 4 : decimals;

      if (!(n instanceof global.bignumber))
        n = global.bignumber(n);

      return global.accounting.formatNumber(n.toFixed(d), d, ',');
    }
  }
);

__.mixin
(
  {
    sanitiseAsTrimString: function(s, maxlen)
    {
      if (!__.isUNB(s))
      {
        if (!__.isString(s))
          s = s.toString();

        var m = (__.isUN(maxlen)) ? 2000 : maxlen;
        // Alternative __.prune(s, m) but may add extra '...' characters to overall length
        return s.trim().substr(0, m);
      }
      return null;
    }
  }
);

__.mixin
(
  {
    sanitiseAsString: function(s, maxlen)
    {
      if (!__.isUNB(s))
      {
        if (!__.isString(s))
          s = s.toString();

        var m = (__.isUN(maxlen)) ? 2000 : maxlen;
        // Alternative __.prune(s, m) but may add extra '...' characters to overall length
        return s.substr(0, m);
      }
      return null;
    }
  }
);

__.mixin
(
  {
    sanitiseAsComment: function(c, maxlen)
    {
      if (!__.isUNB(c))
        return __.sanitiseAsString(__.escapeHTML(c));

      return null;
    }
  }
);

__.mixin
(
  {
    sanitiseAsDate: function(d)
    {
      if (!__.isUNB(d))
      {
        if (__.isString(d))
          return new global.moment(d).format('YYYY-MM-DD HH:mm:ss');
      }
      return null;
    }
  }
);

__.mixin
(
  {
    sanitiseAsDateOnly: function(d)
    {
      if (!__.isUNB(d))
      {
        if (__.isString(d))
          return new global.moment(d).format('YYYY-MM-DD');
      }
      return null;
    }
  }
);

__.mixin
(
  {
    sanitiseAsFriendlyDate: function(d)
    {
      if (!__.isUNB(d))
          return new global.moment(d).format('MMMM Do YYYY, h:mm a');
      return '';
    }
  }
);

__.mixin
(
  {
    stripnonnumeric: function(s)
    {
      s += '';
      var rgx = /^\d|\.|-$/;
      var out = '';

      for (var i = 0; i < s.length; i++)
      {
        if (rgx.test(s.charAt(i)))
        {
          if (!(((s.charAt(i) == '.') && (out.indexOf('.') != -1)) || ((s.charAt(i) == '-') && (out.length != 0))))
            out += s.charAt(i);
        }
      }
      return out;
    }
  }
);

__.mixin
(
  {
    incString: function(input)
    {
      var alphabet = 'abcdefghijklmnopqrstuvwxyz';
      var length = alphabet.length;
      var result = input;
      var i = input.length;

      while (i >= 0)
      {
        var last = input.charAt(--i);
        var next = '';
        var carry = false;

        if (isNaN(last))
        {
          index = alphabet.indexOf(last.toLowerCase());

          if (index === -1)
          {
            next = last;
            carry = true;
          }
          else
          {
            var isUpperCase = last === last.toUpperCase();

            next = alphabet.charAt((index + 1) % length);
            if (isUpperCase)
              next = next.toUpperCase();

            carry = index + 1 >= length;

            if (carry && (i === 0))
            {
              var added = isUpperCase ? 'A' : 'a';

              result = added + next + result.slice(1);
              break;
            }
          }
        }
        else
        {
          next = +last + 1;
          if (next > 9)
          {
            next = 0;
            carry = true
          }

          if (carry && (i === 0))
          {
            result = '1' + next + result.slice(1);
            break;
          }
        }

        result = result.slice(0, i) + next + result.slice(i + 1);
        if (!carry)
          break;
      }
      return result;
    }
  }
);

__.mixin
(
  {
    hasstring: function(s1, s2)
    {
      return s1.indexOf(s2) > -1;
    }
  }
);

__.mixin
(
  {
    makeaddress: function(a)
    {
      var nice = __.isUNB(a.nice) ? false : a.nice;
      var address1 = __.isUNB(a.address1) ? '' : __.titleize(a.address1);
      var city = __.isUNB(a.city) ? '' : __.titleize(a.city);
      var state = __.isUNB(a.state) ? '' : __.titleize(a.state);
      var postcode = __.isUNB(a.postcode) ? '' : a.postcode;
      var country = __.isUNB(a.country) ? '' : __.titleize(a.country);
      var address = address1;

      if (city != '')
      {
        if (address == '')
          address = city;
        else
        {
          if (nice)
            address = address + ',<br/>' + city;
          else
            address = address + ', ' + city;
        }
      }

      if (state != '')
      {
        if (address == '')
          address = state;
        else
        {
          if (nice)
            address = address + ',<br/>' + state;
          else
            address = address + ', ' + state;
        }
      }

      if (postcode != '')
      {
        if (address == '')
          address = postcode;
        else
          address = address + ' ' + postcode;
      }

      if (country != '')
      {
        if (address == '')
          address = country;
        else
        {
          if (nice)
            address = address + ',<br/>' + country;
          else
            address = address + ', ' + country;
        }
      }

      return address;
    }
  }
);

__.mixin
(
  {
    humaniseTimeInMinutes: function(m)
    {
      var txt = '';
      var hours = Math.floor(m / 60);
      var minutes = m - (hours * 60);

      if (hours > 0)
      {
        var txt = '';

        if (hours == 1)
          txt = '1 hour';
        else
          txt = hours + ' hours';

        if (minutes > 0)
        {
          if (minutes == 1)
            txt += ', 1 minute';
          else
            txt += ', ' + minutes + ' minutes';
        }
      }
      else
      {
        if (minutes > 0)
        {
          if (minutes == 1)
            txt = 'A minute';
          else
            txt = minutes + ' minutes';
        }
      }
      return txt;
    }
  }
);

__.mixin
(
  {
    makeisomobile: function(m)
    {
      // Strip all non-numeric characters - so hopefully end up with something like 0433123456
      // Then strip out the leading zero and replace with +61
      var n = __.stripnonnumeric(m);

      if (n.substring(0, 1) == '0')
        n = '+' + global.config.defaults.defaultmobilecountryprefix + n.substring(1);

      return n;
    }
  }
);

__.mixin
(
  {
    isUNB: function(d)
    {
      return __.isUndefined(d) || __.isNull(d) || __.isBlank(d);
    }
  }
);

__.mixin
(
  {
    isUN: function(d)
    {
      return __.isUndefined(d) || __.isNull(d);
    }
  }
);

__.mixin
(
  {
    wordwrap: function(str, width, brk, cut)
    {
      brk = brk || 'n';
      width = width || 75;
      cut = cut || false;

      if (!str)
        return str;

      var regex = '.{1,' + width + '}(\s|$)' + (cut ? '|.{' + width + '}|.+$' : '|\S+?(\s|$)');

      return str.match(RegExp(regex, 'g')).join(brk);
    }
  }
);

// *******************************************************************************************************************************************************************************************
// Global helper functions...
global.ConsoleLog = function(txt)
{
  if (global.config.env.debug)
    console.log(txt);
};

global.fileExists = function(f)
{
  if (global.fs.existsSync(global.config.env.localfs + f))
    return true;
  return false;
};

global.ensureFolderExists = function(path, mask, cb)
{
  // Allow the `mask` parameter to be optional
  if (typeof mask == 'function')
  {
    cb = mask;
    mask = 0777;
  }

  global.fs.mkdir
  (
    path,
    mask,
    function(err)
    {
      if (!err)
        cb(null);
      else
      {
        // Ignore the error if the folder already exists
        if (err.code == 'EEXIST')
          cb(null);
        else
          cb(err);
      }
    }
  );
};

global.doAttachmentImageURL = function(orderid, attachmentid, attachmentname, mimetype)
{
  var image = '';

  if (global.isMimeTypeImage(mimetype))
    image = global.config.folders.orderattachments + attachmentid + '_' + orderid + '_' + attachmentname;

  return image;
};

global.doJobSheetImageURL = function(jobsheetid, imagename, mimetype)
{
  var image = '';

  if (global.isMimeTypeImage(mimetype))
    image = global.config.folders.jobsheetimages + jobsheetid + '_' + imagename;

  return image;
};

global.StringArrayToString = function(a)
{
  var s = '';

  if (a.length > 0)
  {
    s = '\'' + a[0] + '\'';
    for (var i = 1; i < a.length; i++)
      s += ',\'' + a[i] + '\'';
  }

  return s;
};

global.safejsonstringify = function(obj, callback)
{
  try
  {
    if (!__.isUNB(obj) && !__.isEmpty(obj))
      return callback(null, global.json3.stringify(obj));
    return callback({message: global.text_unablestringifyjson}, null);
  }

  catch (err)
  {
    return callback(err, null);
  }
};

global.safejsonparse = function(json, callback)
{
  try
  {
    if (!__.isUNB(json))
      return callback(null, global.json3.parse(json));
    return callback({message: global.text_unableparsejson}, null);
  }

  catch (err)
  {
    return callback(err, null);
  }
};

// Example how to iterate through Redis hash keys...
global.userFromUid = function(uid)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      global.users.keys
      (
        global.config.redis.prefix + '*',
        function(err, list)
        {
          if (!err)
          {
            var keys = Object.keys(list);
            var keycount = keys.length;

            if (keycount > 0)
            {
              uid = uid.toUpperCase();
              keys.some
              (
                function(k)
                {
                  global.users.get
                  (
                    list[k],
                    function(err, uuidobj)
                    {
                      if (!err)
                      {
                        global.safejsonparse
                        (
                          uuidobj,
                          function(err, uo)
                          {
                            if (!err)
                            {
                              if (uo.uid.toUpperCase() == uid)
                                resolve(uo);
                            }
                          }
                        );
                      }

                      // Finished searching - if haven't found it, reject(), if we had already found it, resolve() would have already been called...
                      if (--keycount == 0)
                        reject(undefined);
                    }
                  );
                }
              );
            }
            else
              reject(undefined);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
};

global.userFromUserid = function(userid)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      global.users.keys
      (
        global.config.redis.prefix + '*',
        function(err, list)
        {
          if (!err)
          {
            var keys = Object.keys(list);
            var keycount = keys.length;

            if (keycount > 0)
            {
              userid = __.makeBigInt(userid);
              keys.some
              (
                function(k)
                {
                  global.users.get
                  (
                    list[k],
                    function(err, uuidobj)
                    {
                      if (!err)
                      {
                        global.safejsonparse
                        (
                          uuidobj,
                          function(err, uo)
                          {
                            if (!err)
                            {
                              if (userid.equals(__.makeBigInt(uo.userid)))
                                resolve(uo);
                            }
                          }
                        );
                      }

                      // Finished searching - if haven't found it, reject(), if we had already found it, resolve() would have already been called...
                      if (--keycount == 0)
                        reject(undefined);
                    }
                  );
                }
              );
            }
            else
              reject(undefined);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
};

global.usersLoggedIn = function()
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      global.users.keys
      (
        global.config.redis.prefix + '*',
        function(err, list)
        {
          if (!err)
          {
            var keys = Object.keys(list);
            var keycount = keys.length;
            var calls = [];

            if (keycount > 0)
            {
              keys.forEach
              (
                function(k)
                {
                  calls.push
                  (
                    function(callback)
                    {
                      global.users.get
                      (
                        list[k],
                        function(err, uuidobj)
                        {
                          if (!err)
                          {
                            global.safejsonparse
                            (
                              uuidobj,
                              function(err, uo)
                              {
                                if (!err)
                                {
                                  if (!__.isNull(uo.sparkid) && !__.isNull(uo.session))
                                    callback(null, {uuid: uo.uuid, uname: uo.uname});
                                  else
                                    callback(null);
                                }
                                else
                                  callback(err);
                              }
                            );
                          }
                          else
                            callback(err);
                        }
                      );
                    }
                  );
                }
              );

              global.async.parallel
              (
                calls,
                function(err, results)
                {
                  if (!err)
                  {
                    var users = [];
                    results.forEach
                    (
                      function(u)
                      {
                        if (!__.isUN(u))
                          users.push(u);
                      }
                    );
                    resolve(users);
                  }
                  else
                    reject(err);
                }
              );
            }
            else
              reject(undefined);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
};

global.getCustConfig = function(custid)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      global.customers.get
      (
        global.config.redis.custconfig + custid,
        function(err, cfgobj)
        {
          if (!err)
          {
            global.safejsonparse
            (
              cfgobj,
              function(err, co)
              {
                if (!err && co)
                  resolve(co);
                else
                  reject(co);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
};

global.setCustConfig = function(custid, data)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      global.safejsonstringify
      (
        data,
        function(err, json)
        {
          if (!err)
          {
            global.customers.set(global.config.redis.custconfig + custid, json);
            resolve(null);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
};

global.isMimeTypeImage = function(mt)
{
  var isimage = false;

  if (!__.isUNB(mt))
  {
    if (__.hasstring(mt, 'image') || __.hasstring(mt, 'png') || __.hasstring(mt, 'jpg') || __.hasstring(mt, 'gif') || __.hasstring(mt, 'bmp') || __.hasstring(mt, 'jpeg'))
      isimage = true;
  }

  return isimage;
};

global.isMimeTypeDoc = function(mt)
{
  var isdoc = false;

  if (!__.isUNB(mt))
  {
    if (__.hasstring(mt, 'officedocument') || __.hasstring(mt, 'msword'))
    isdoc = true;
  }

  return isdoc;
};

global.isMimeTypeSheet = function(mt)
{
  var issheet = false;

  if (!__.isUNB(mt))
  {
    if (__.hasstring(mt, 'excel') || __.hasstring(m, 'spreadsheet'))
      issheet = true;
  }

  return issheet;
};

global.copyFile = function(source, target, cb)
{
  var cbCalled = false;
  var rd = global.fs.createReadStream(source);

  rd.on
  (
    'error',
    function(err)
    {
      done(err);
    }
  );

  var wr = fs.createWriteStream(target);

  wr.on
  (
    'error',
    function(err)
    {
      done(err);
    }
  );

  wr.on
  (
    'close',
    function(ex)
    {
      done();
    }
  );

  rd.pipe(wr);

  function done(err)
  {
    if (!cbCalled)
    {
      cb(err);
      cbCalled = true;
    }
  }
};

global.createSMTPTransport = function()
{
  if (__.isNull(global.transporter))
  {
    global.transporter = global.mailer.createTransport
    (
      global.smtptransport
      (
        {
          host: global.config.smtp.host,
          port: global.config.smtp.port,
          pool: global.config.smtp.pool,
          secure: global.config.smtp.secure,
          auth:
          {
            user: global.config.smtp.user,
            pass: global.config.smtp.pass
          }
        }
      )
    );
  }

  return global.transporter;
};

// http://web.archive.org/web/20130827210000/http://www.overset.com/2008/09/01/javascript-natural-sort-algorithm/
global.NaturalSortNameObjArray = function(a, b)
{
  var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi;
  var sre = /(^[ ]*|[ ]*$)/g;
  var dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/;
  var hre = /^0x[0-9a-f]+$/i;
  var ore = /^0/;
  var i = function(s) {return global.NaturalSortNameObjArray.Insensitive && ('' + s).toLowerCase() || '' + s;};
  // Convert all to strings strip whitespace
  var x = i(a.name).replace(sre, '') || '';
  var y = i(b.name).replace(sre, '') || '';
  // Chunk/tokenize
  var xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0');
  var yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0');
  // Numeric, hex or date detection
  var xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x));
  var yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null;
  var oFxNcL, oFyNcL;
  // First try and sort Hex codes or Dates
  if (yD)
  {
    if (xD < yD) return -1;
    if (xD > yD) return 1;
  }
  // Natural sorting through split numeric strings and default strings
  for (var cLoc = 0, numS = Math.max(xN.length, yN.length); cLoc < numS; cLoc++)
  {
    // Find floats not starting with '0', string or 0 if not defined (Clint Priest)
    oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
    oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;

    // Handle numeric vs string comparison - number < string - (Kyle Adams)
    if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {return (isNaN(oFxNcL)) ? 1 : -1;}

    // Rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
    if (typeof oFxNcL !== typeof oFyNcL)
    {
      oFxNcL += '';
      oFyNcL += '';
    }
    if (oFxNcL < oFyNcL) return -1;
    if (oFxNcL > oFyNcL) return 1;
  }
  return 0;
};

global.NaturalSortStringArray = function(a, b)
{
  var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi;
  var sre = /(^[ ]*|[ ]*$)/g;
  var dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/;
  var hre = /^0x[0-9a-f]+$/i;
  var ore = /^0/;
  var i = function(s) {return global.NaturalSortStringArray.Insensitive && ('' + s).toLowerCase() || '' + s;};
  // Convert all to strings strip whitespace
  var x = i(a).replace(sre, '') || '';
  var y = i(b).replace(sre, '') || '';
  // Chunk/tokenize
  var xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0');
  var yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0');
  // Numeric, hex or date detection
  var xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x));
  var yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null;
  var oFxNcL, oFyNcL;
  // First try and sort Hex codes or Dates
  if (yD)
  {
    if (xD < yD) return -1;
    if (xD > yD) return 1;
  }
  // Natural sorting through split numeric strings and default strings
  for (var cLoc = 0, numS = Math.max(xN.length, yN.length); cLoc < numS; cLoc++)
  {
    // Find floats not starting with '0', string or 0 if not defined (Clint Priest)
    oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
    oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;

    // Handle numeric vs string comparison - number < string - (Kyle Adams)
    if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {return (isNaN(oFxNcL)) ? 1 : -1;}

    // Rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
    if (typeof oFxNcL !== typeof oFyNcL)
    {
      oFxNcL += '';
      oFyNcL += '';
    }
    if (oFxNcL < oFyNcL) return -1;
    if (oFxNcL > oFyNcL) return 1;
  }
  return 0;
};

// *******************************************************************************************************************************************************************************************
// Local helper functions...
function readConfig()
{
  var configfile = global.fs.readFileSync('./config.ini', {encoding: 'utf-8'});
  var options =
  {
    sections: true,
    comments: '#',
    separators: '=',
    strict: true
  };

  global.config = prop.parse
  (
    configfile,
    options
  );

  // Read in all avatar files/images...
  fs.readdir
  (
    global.path.join(__dirname, global.config.folders.avatars),
    function(err, items)
    {
      global.avatars = '';

      if (!err)
      {
        var idx = 0;

        // Sort nicely otherwise we get a1, a10, a100, a11.... instead of a1, a2, a3...
        items = items.sort(global.NaturalSortStringArray);

        items.forEach
        (
          function(f)
          {
            if (f.indexOf('.DS_Store') == -1)
            {
              var name = f.split('.');

              if (idx++ > 0)
                global.avatars += ',';

              // Build array of avatar objects ready for HTML combo later...
              global.avatars += '{name: \'' + name[0] + '\', image: \'' + f + '\'}';
            }
          }
        );
      }
    }
  );
}

/*
function makeWorld(spark, eventname, data)
{
  var funcargs = [];

  // Capture function arguments here - won't be available afterwards...
  for (var a = 3; a < arguments.length; a++)
    funcargs.push(arguments[a]);

  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (!__.isUndefined(data.fguid))
      {
        var argname = '';
        var ismandatory = false;
        var nummandatory = 0;
        var mandatoryfound = 0;
        var argsfound = 0;

        // fguid, uuid and session vars always mandatory with every request except login...

        if (__.isUndefined(data.uuid) || __.isBlank(data.uuid) || __.isUndefined(data.session))
        {
          if (__.isUndefined(data.uuid) || __.isBlank(data.uuid))
            spark.emit(global.eventerror, {rc: global.errcode_notloggedin, msg: global.text_notloggedin, eventname: eventname, pdata: data.pdata});
          else
            spark.emit(global.eventerror, {rc: global.errcode_invalidsession, msg: global.text_invalidsession, eventname: eventname, pdata: data.pdata});
          reject({rc: global.text_missingparams});
        }
        else
        {
          global.ConsoleLog('========== makeWorld: eventname: ' + eventname + ', fguid: ' + data.fguid + ', uuid: ' + data.uuid + ', session: ' + data.session);

          // Find user in cache...
          global.users.get
          (
            global.config.redis.prefix + data.uuid,
            function(err, uuidobj)
            {
              if (!err)
              {
                // Found user in cache, check session matches etc...
                //if (uuidobj.session == data.session)
                if (true)
                {
                  global.safejsonparse
                  (
                    uuidobj,
                    function(err, uo)
                    {
                      if (!err)
                      {
                        var world = {};
                        // Just update the really dynamic stuff....
                        uo.fguid = data.fguid;
                        uo.sparkid = spark.id;

                        spark.myUuid = data.uuid;

                        // While we're here, get config object for this customer, saves individual functions looking for it later...
                        global.customers.get
                        (
                          global.config.redis.custconfig + uo.custid,
                          function(err, configobj)
                          {
                            if (!err)
                            {
                              global.safejsonparse
                              (
                                configobj,
                                function(err, co)
                                {
                                  if (!err)
                                  {
                                    world.custconfig = co;

                                    // Now check for existence of params...
                                    funcargs.forEach
                                    (
                                      function(argname)
                                      {
                                        // If argument name starts with asterisk, it's mandatory and we need to find it...
                                        if (__.startsWith(argname, '*'))
                                        {
                                          argname = __.ltrim(argname, '*');
                                          ismandatory = true;
                                          nummandatory++;
                                        }
                                        else
                                          ismandatory = false;
                                        //
                                        if (!__.isUndefined(data[argname]))
                                        {
                                          world[argname] = data[argname];
                                          argsfound++;
                                          // Mandatory argument and we found it...
                                          if (ismandatory)
                                            mandatoryfound++;
                                        }
                                      }
                                    );
                                    // Get all the mandatory arguments we're looking for?
                                    // If not, then we need at least one?
                                    if ((mandatoryfound < nummandatory) || ((argsfound == 0) && (nummandatory > 0)))
                                    {
                                      spark.emit(global.eventerror, {rc: global.errcode_missingparams, msg: global.text_missingparams, eventname: eventname, pdata: data.pdata});
                                      reject({rc: global.errcode_missingparams});
                                    }
                                    else
                                    {
                                      // Params for this request...
                                      world.uuid = data.uuid;
                                      world.session = data.session;
                                      world.fguid = data.fguid;
                                      world.spark = spark;
                                      world.eventname = eventname;
                                      world.pdata = data.pdata;
                                      world.cn = uo;
                                      resolve(world);
                                    }
                                  }
                                }
                              );
                            }
                            else
                            {
                              // Can't get to customer config for some reason...
                              global.log.error({as1: true}, '[makeworld] ' + global.text_unablegetcustconfig + ' ' + configobj + ', for uuid: ' + data.uuid);
                              spark.emit(global.eventerror, {rc: global.errcode_unablegetcustconfig, msg: global.text_unablegetcustconfig, eventname: eventname, pdata: data.pdata});
                              reject({rc: global.errcode_unablegetcustconfig});
                            }
                          }
                        );
                      }
                      else
                      {
                        // Most likely this user's UUID has changed - so their cached version is no longer valid...
                        global.log.error({as1: true}, '[makeworld] ' + global.text_unableparsejson + ' ' + uuidobj + ', for uuid: ' + data.uuid);
                        spark.emit(global.eventerror, {rc: global.errcode_sessionexpired, msg: global.text_sessionexpired, eventname: eventname, pdata: data.pdata});
                        reject({rc: global.errcode_sessionexpired});
                      }
                    }
                  );
                }
                else
                {
                  spark.emit(global.eventerror, {rc: global.errcode_sessionexpired, msg: global.text_sessionexpired, eventname: eventname, pdata: data.pdata});
                  reject({rc: global.errcode_sessionexpired});
                }
              }
              else
              {
                spark.emit(global.eventerror, {rc: global.errcode_unablerestoresession, msg: global.text_unablerestoresession, eventname: eventname, pdata: data.pdata});
                reject({rc: global.errcode_unablerestoresession});
              }
            }
          );
        }
      }
      else
      {
        spark.emit(global.eventerror, {rc: global.errcode_invalidclient, msg: global.text_invalidclient, eventname: eventname, pdata: data.pdata});
        reject({rc: global.errcode_invalidclient});
      }
    }
  );
  return promise;
};
*/

function makeWorld2(spark, eventname, data, funcargs)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (!__.isUndefined(data.fguid))
      {
        var argname = '';
        var ismandatory = false;
        var nummandatory = 0;
        var mandatoryfound = 0;
        var argsfound = 0;

        // fguid, uuid and session vars always mandatory with every request except login...

        if (__.isUndefined(data.uuid) || __.isBlank(data.uuid) || __.isUndefined(data.session))
        {
          if (__.isUndefined(data.uuid) || __.isBlank(data.uuid))
            spark.emit(global.eventerror, {rc: global.errcode_notloggedin, msg: global.text_notloggedin, eventname: eventname, pdata: data.pdata});
          else
            spark.emit(global.eventerror, {rc: global.errcode_invalidsession, msg: global.text_invalidsession, eventname: eventname, pdata: data.pdata});
          reject({rc: global.text_missingparams});
        }
        else
        {
          global.ConsoleLog('========== makeWorld: eventname: ' + eventname + ', fguid: ' + data.fguid + ', uuid: ' + data.uuid + ', session: ' + data.session);

          // Find user in cache...
          global.users.get
          (
            global.config.redis.prefix + data.uuid,
            function(err, uuidobj)
            {
              if (!err)
              {
                // Found user in cache, check session matches etc...
                //if (uuidobj.session == data.session)
                if (true)
                {
                  global.safejsonparse
                  (
                    uuidobj,
                    function(err, uo)
                    {
                      if (!err)
                      {
                        var world = {};
                        // Just update the really dynamic stuff....
                        uo.fguid = data.fguid;
                        uo.sparkid = spark.id;

                        spark.myUuid = data.uuid;

                        // While we're here, get config object for this customer, saves individual functions looking for it later...
                        global.customers.get
                        (
                          global.config.redis.custconfig + uo.custid,
                          function(err, configobj)
                          {
                            if (!err)
                            {
                              global.safejsonparse
                              (
                                configobj,
                                function(err, co)
                                {
                                  if (!err)
                                  {
                                    world.custconfig = co;

                                    // Now check for existence of params...
                                    funcargs.forEach
                                    (
                                      function(argname)
                                      {
                                        // If argument name starts with asterisk, it's mandatory and we need to find it...
                                        if (__.startsWith(argname, '*'))
                                        {
                                          argname = __.ltrim(argname, '*');
                                          ismandatory = true;
                                          nummandatory++;
                                        }
                                        else
                                          ismandatory = false;
                                        //
                                        if (!__.isUndefined(data[argname]))
                                        {
                                          world[argname] = data[argname];
                                          argsfound++;
                                          // Mandatory argument and we found it...
                                          if (ismandatory)
                                            mandatoryfound++;
                                        }
                                      }
                                    );
                                    // Get all the mandatory arguments we're looking for?
                                    // If not, then we need at least one?
                                    if ((mandatoryfound < nummandatory) || ((argsfound == 0) && (nummandatory > 0)))
                                    {
                                      spark.emit(global.eventerror, {rc: global.errcode_missingparams, msg: global.text_missingparams, eventname: eventname, pdata: data.pdata});
                                      reject({rc: global.errcode_missingparams});
                                    }
                                    else
                                    {
                                      // Params for this request...
                                      world.uuid = data.uuid;
                                      world.session = data.session;
                                      world.fguid = data.fguid;
                                      world.spark = spark;
                                      world.eventname = eventname;
                                      world.pdata = data.pdata;
                                      world.cn = uo;
                                      resolve(world);
                                    }
                                  }
                                }
                              );
                            }
                            else
                            {
                              // Can't get to customer config for some reason...
                              global.log.error({as1: true}, '[makeworld] ' + global.text_unablegetcustconfig + ' ' + configobj + ', for uuid: ' + data.uuid);
                              spark.emit(global.eventerror, {rc: global.errcode_unablegetcustconfig, msg: global.text_unablegetcustconfig, eventname: eventname, pdata: data.pdata});
                              reject({rc: global.errcode_unablegetcustconfig});
                            }
                          }
                        );
                      }
                      else
                      {
                        // Most likely this user's UUID has changed - so their cached version is no longer valid...
                        global.log.error({as1: true}, '[makeworld] ' + global.text_unableparsejson + ' ' + uuidobj + ', for uuid: ' + data.uuid);
                        spark.emit(global.eventerror, {rc: global.errcode_sessionexpired, msg: global.text_sessionexpired, eventname: eventname, pdata: data.pdata});
                        reject({rc: global.errcode_sessionexpired});
                      }
                    }
                  );
                }
                else
                {
                  spark.emit(global.eventerror, {rc: global.errcode_sessionexpired, msg: global.text_sessionexpired, eventname: eventname, pdata: data.pdata});
                  reject({rc: global.errcode_sessionexpired});
                }
              }
              else
              {
                spark.emit(global.eventerror, {rc: global.errcode_unablerestoresession, msg: global.text_unablerestoresession, eventname: eventname, pdata: data.pdata});
                reject({rc: global.errcode_unablerestoresession});
              }
            }
          );
        }
      }
      else
      {
        spark.emit(global.eventerror, {rc: global.errcode_invalidclient, msg: global.text_invalidclient, eventname: eventname, pdata: data.pdata});
        reject({rc: global.errcode_invalidclient});
      }
    }
  );
  return promise;
};

// *******************************************************************************************************************************************************************************************
// Begin code execution...
var server = null;
var app = express();

readConfig();

global.log = bunyan.createLogger
(
  {
    name: global.config.log.name,
    streams:
    [
      {
        src: true,
        type: 'rotating-file',
        period: '1w',
        count: 26,
        level: 'info',
        path: global.config.log.info
      },
      {
        src: true,
        type: 'rotating-file',
        period: '1w',
        count: 26,
        level: 'warn',
        path: global.config.log.warn
      },
      {
        src: true,
        type: 'rotating-file',
        period: '1w',
        count: 26,
        level: 'error',
        path: global.config.log.error
      },
      {
        src: true,
        type: 'rotating-file',
        period: '1w',
        count: 26,
        level: 'debug',
        path: global.config.log.debug
      }
    ]
  }
);

process.on
(
  'uncaughtException',
  function(err)
  {
    global.log.error({as1: true}, '[worker] Uncaught exception, stack trace: ' + err.stack);

    if (global.config.env.debug)
      console.log('[worker] Uncaught exception, stack trace: ' + err.stack);
  }
);

global.cs = 'postgres://' + global.config.dbmain.user + ':' + global.config.dbmain.password + '@' + global.config.dbmain.host + '/' + global.config.dbmain.db;
global.geocoder = global._geocoder({provider: global.config.geocoder.provider, httpAdapter: global.config.geocoder.httpadapter, apiKey: global.config.google.webkey});

// *******************************************************************************************************************************************************************************************
// CRON jobs...
var jobRTapReport = new cronjob
(
  {
    cronTime: global.config.cron.rtapreport,
    onTick: function()
    {
      //global.log.error({cron_rtapreport: true}, 'CRON [rtapreport] Started: ' + global.moment().format('YYYY-MM-DD hh:mm:ss'));
      console.log('CRON [rtapreport] Started');
      //global.log.error({cron_rtapreport: true}, 'CRON [rtapreport] Completed: ' + global.moment().format('YYYY-MM-DD hh:mm:ss'));
      global.modprinting.EmailRfidTaps();
    },
    start: true
  }
);

// *******************************************************************************************************************************************************************************************
// Web stuff...
if (!global.config.env.secure)
{
  server = http.createServer(app);
  main();
}
else
{
  var key = global.fs.readFileSync(global.config.env.ssl_priv.toString());
  var crt = global.fs.readFileSync(global.config.env.ssl_cert.toString());

  server = https.createServer
  (
    {
      key: key,
      cert: crt,
      requestCert: true,
      rejectUnauthorised: false
    },
    app
  );

  main();
}

function main()
{
  var notifications = require('./routes/notifications');
  var dropclientattachments = require('./routes/dropclientattachment');
  var dropsupplierattachments = require('./routes/dropsupplierattachment');
  var droporderattachments = require('./routes/droporderattachment');
  var dropprinttemplates = require('./routes/dropprinttemplate');
  var dropdataimport = require('./routes/dropdataimport');

  var dropjobsheet = require('./routes/dropjobsheet');

  var throwclientattachments = require('./routes/throwclientattachment');
  var throwsupplierattachments = require('./routes/throwsupplierattachment');
  var throworderattachments = require('./routes/throworderattachment');
  var throwprinttemplates = require('./routes/throwprinttemplate');
  var rtap = require('./routes/rtap');

  //app.use(connect.json());
  app.use(connect.urlencoded());
  app.use(cors());

  app.post
  (
    '/notifications',
    function(req, res)
    {
      notifications.notificationsPost(req, res);
    }
  );

  app.post
  (
    '/dropclientattachment',
    multipart(),
    function(req, res)
    {
      dropclientattachments.dropClientAttachmentPost(req, res);
    }
  );

  app.post
  (
    '/dropsupplierattachment',
    multipart(),
    function(req, res)
    {
      dropsupplierattachments.dropSupplierAttachmentPost(req, res);
    }
  );

  app.post
  (
    '/droporderattachment',
    multipart(),
    function(req, res)
    {
      droporderattachments.dropOrderAttachmentPost(req, res);
    }
  );

  app.post
  (
    '/dropprinttemplate',
    multipart(),
    function(req, res)
    {
      dropprinttemplates.dropPrintTemplatePost(req, res);
    }
  );

  app.post
  (
    '/dropjobsheet',
    multipart(),
    function(req, res)
    {
      dropjobsheet.dropJobSheetPost(req, res);
    }
  );

  // Data imports...
  app.post
  (
    '/dataimportproducts',
    multipart(),
    function(req, res)
    {
      dropdataimport.dropDataImportProductsPost(req, res);
    }
  );

  app.post
  (
    '/dataimportclients',
    multipart(),
    function(req, res)
    {
      dropdataimport.dropDataImportClientsPost(req, res);
    }
  );

  app.post
  (
    '/dataimportsuppliers',
    multipart(),
    function(req, res)
    {
      dropdataimport.dropDataImportSuppliersPost(req, res);
    }
  );

  app.post
  (
    '/dataimportemployees',
    multipart(),
    function(req, res)
    {
      dropdataimport.dropDataImportEmployeesPost(req, res);
    }
  );

  app.post
  (
    '/dataimportaccounts',
    multipart(),
    function(req, res)
    {
      dropdataimport.dropDataImportAccountsPost(req, res);
    }
  );

  // Remedy Tap...
  app.post
  (
    '/rtap',
    function(req, res)
    {
      rtap.RfidTap(req, res);
    }
  );

  // Download rtaps
  app.get
  (
    '/gettaps',
    function(req, res)
    {
      global.modprinting.GetRfidTaps(req, res);
    }
  );

  app.get
  (
    '/gettapperiod',
    function(req, res)
    {
      global.modprinting.GetRfidTapPeriod(req, res);
    }
  );

  // Download specified order/invoice
  app.get
  (
    '/di',
    function(req, res)
    {
      global.modprinting.SendInvoice(req, res);
    }
  );

  app.get
  (
    '/do',
    function(req, res)
    {
      global.modprinting.SendOrder(req, res);
    }
  );

  app.get
  (
    '/js',
    function(req, res)
    {
      global.modprinting.SendJobSheet(req, res);
    }
  );

  app.get
  (
    '/pos',
    function(req, res)
    {
      var posobj = global.fs.readFileSync(global.path.join(__dirname, 'routes/pos.html'));
      var poshtml = posobj.toString();

      poshtml = poshtml.replace(/XXX_LOGO1/g, global.config.pos.logo);

      poshtml = poshtml.replace(/XXX_APPTITLE/g, global.config.about.title);
      poshtml = poshtml.replace(/XXX_MENUTITLE/g, global.config.about.menutitle);
      poshtml = poshtml.replace(/XXX_MENUSUBTITLE/g, global.config.about.menusubtitle);
      poshtml = poshtml.replace(/XXX_COPYRIGHT/g, global.config.about.copyright);
      poshtml = poshtml.replace(/XXX_OWNER/g, global.config.about.owner);
      poshtml = poshtml.replace(/XXX_MENUICON/g, global.config.about.menuicon);
      poshtml = poshtml.replace(/XXX_MENULOGO/g, global.config.about.menulogo);
      poshtml = poshtml.replace(/XXX_BUILDNO/g, global.config.env.version);

      poshtml = poshtml.replace(/XXX_DEFAULTCOUNTRY/g, global.config.defaults.defaultcountry);

      poshtml = poshtml.replace(/XXX_FAVICO16/g, global.config.env.favico16);
      poshtml = poshtml.replace(/XXX_FAVICO32/g, global.config.env.favico32);

      poshtml = poshtml.replace(/XXX_META_TITLE/g, global.config.meta.title);
      poshtml = poshtml.replace(/XXX_META_DESCRIPTION/g, global.config.meta.description);
      poshtml = poshtml.replace(/XXX_META_KEYWORDS/g, global.config.meta.keywords);
      poshtml = poshtml.replace(/XXX_META_REPLYTO/g, global.config.meta.replyto);
      poshtml = poshtml.replace(/XXX_META_COPYRIGHT/g, global.config.meta.copyright);

      poshtml = poshtml.replace(/XXX_GOOGLEWEBKEY/g, global.config.google.webkey);
      poshtml = poshtml.replace(/XXX_GOOGLEDEFAULTREGION/g, global.config.google.defaultregion);

      poshtml = poshtml.replace(/XXX_ERRCODE_NONE/g, global.config.errorcodes.errcode_none);
      poshtml = poshtml.replace(/XXX_ERRCODE_NODATA/g, global.config.errorcodes.errcode_nodata);
      poshtml = poshtml.replace(/XXX_ERRCODE_MISSINGPARAMS/g, global.config.errorcodes.errcode_missingparams);
      poshtml = poshtml.replace(/XXX_ERRCODE_FATAL/g, global.config.errorcodes.errcode_fatal);
      poshtml = poshtml.replace(/XXX_ERRCODE_NOTLOGGEDIN/g, global.config.errorcodes.errcode_notloggedin);
      poshtml = poshtml.replace(/XXX_ERRCODE_SESSIONEXPIRED/g, global.config.errorcodes.errcode_sessionexpired);
      poshtml = poshtml.replace(/XXX_ERRCODE_RESOURCEUNAVAIL/g, global.config.errorcodes.errcode_resourceunavail);
      poshtml = poshtml.replace(/XXX_ERRCODE_DBUNAVAIL/g, global.config.errorcodes.errcode_dbunavail);
      poshtml = poshtml.replace(/XXX_ERRCODE_USEREXISTS/g, global.config.errorcodes.errcode_userexists);
      poshtml = poshtml.replace(/XXX_ERRCODE_DBERR/g, global.config.errorcodes.errcode_dberr);
      poshtml = poshtml.replace(/XXX_ERRCODE_FILEERR/g, global.config.errorcodes.errcode_fileerr);
      poshtml = poshtml.replace(/XXX_ERRCODE_USERNOTREGISTERED/g, global.config.errorcodes.errcode_usernotregistered);
      poshtml = poshtml.replace(/XXX_ERRCODE_PASSWDHASH/g, global.config.errorcodes.errcode_passwdhash);
      poshtml = poshtml.replace(/XXX_ERRCODE_INVALIDCONNECTION/g, global.config.errorcodes.errcode_invalidconnection);
      poshtml = poshtml.replace(/XXX_ERRCODE_INVALIDLOGIN/g, global.config.errorcodes.errcode_invalidlogin);
      poshtml = poshtml.replace(/XXX_ERRCODE_MISSINGURL/g, global.config.errorcodes.errcode_missingurl);
      poshtml = poshtml.replace(/XXX_ERRCODE_SMSERROR/g, global.config.errorcodes.errcode_smserror);
      poshtml = poshtml.replace(/XXX_ERRCODE_INVALIDSESSION/g, global.config.errorcodes.errcode_invalidsession);
      poshtml = poshtml.replace(/XXX_ERRCODE_INVALIDCLIENT/g, global.config.errorcodes.errcode_invalidclient);
      poshtml = poshtml.replace(/XXX_ERRCODE_UNABLERESTORESESSION/g, global.config.errorcodes.errcode_unablerestoresession);
      poshtml = poshtml.replace(/XXX_ERRCODE_COMMITTX/g, global.config.errorcodes.errcode_committx);
      poshtml = poshtml.replace(/XXX_ERRCODE_JSONPARSE/g, global.config.errorcodes.errcode_jsonparse);
      poshtml = poshtml.replace(/XXX_ERRCODE_JSONSTRINGIFY/g, global.config.errorcodes.errcode_jsonstringify);
      poshtml = poshtml.replace(/XXX_ERRCODE_UNABLECREATENEWUSER/g, global.config.errorcodes.errcode_unablecreatenewuser);
      poshtml = poshtml.replace(/XXX_ERRCODE_UNABLELOGINUSER/g, global.config.errorcodes.errcode_unableloginuser);
      poshtml = poshtml.replace(/XXX_ERRCODE_UNABLESAVECLIENT/g, global.config.errorcodes.errcode_unablesaveclient);
      poshtml = poshtml.replace(/XXX_ERRCODE_UNABLESAVEPRODUCT/g, global.config.errorcodes.errcode_unablesaveproduct);
      poshtml = poshtml.replace(/XXX_ERRCODE_INSUFFICIENTQTY/g, global.config.errorcodes.errcode_insufficientqty);

      poshtml = poshtml.replace(/XXX_BARCODE_FORMAT/g, global.config.barcodes.format);
      poshtml = poshtml.replace(/XXX_BARCODE_LENGTH/g, global.config.barcodes.length);
      poshtml = poshtml.replace(/XXX_BARCODE_PREFIX_LENGTH/g, global.config.barcodes.prefixlength);

      poshtml = poshtml.replace(/XXX_POSPRINTERIP/g, global.config.pos.printerip);
      poshtml = poshtml.replace(/XXX_POSPRINTERPORT/g, global.config.pos.printerport);
      poshtml = poshtml.replace(/XXX_POSPRINTERID/g, global.config.pos.printerid);
      poshtml = poshtml.replace(/XXX_POSWORDWRAP1/g, global.config.pos.printerwordwrap1);
      poshtml = poshtml.replace(/XXX_POSCREDITPIN/g, global.config.pos.creditpin);

      poshtml = poshtml.replace(/XXX_POSABN/g, global.config.pos.abn);
      poshtml = poshtml.replace(/XXX_POSPHONE/g, global.config.pos.phone);
      poshtml = poshtml.replace(/XXX_POSADDRESS1/g, global.config.pos.address1);
      poshtml = poshtml.replace(/XXX_POSADDRESS1/g, global.config.pos.address2);

      poshtml = poshtml.replace(/XXX_POSPOLICY1/g, global.config.pos.policy1);
      poshtml = poshtml.replace(/XXX_POSPOLICY2/g, global.config.pos.policy2);
      poshtml = poshtml.replace(/XXX_POSFOOTER1/g, global.config.pos.footer1);

      poshtml = poshtml.replace(/XXX_ABNLOOKUP/g, global.config.gov.abnlookup);

      res.send(poshtml);
    }
  );

  app.get
  (
    '/',
    function(req, res)
    {
      var indexobj = global.fs.readFileSync(global.path.join(__dirname, 'routes/index.html'));
      var indexhtml = indexobj.toString();

      indexhtml = indexhtml.replace(/XXX_APPTITLE/g, global.config.about.title);
      indexhtml = indexhtml.replace(/XXX_MENUTITLE/g, global.config.about.menutitle);
      indexhtml = indexhtml.replace(/XXX_MENUSUBTITLE/g, global.config.about.menusubtitle);
      indexhtml = indexhtml.replace(/XXX_COPYRIGHT/g, global.config.about.copyright);
      indexhtml = indexhtml.replace(/XXX_OWNER/g, global.config.about.owner);
      indexhtml = indexhtml.replace(/XXX_MENUICON/g, global.config.about.menuicon);
      indexhtml = indexhtml.replace(/XXX_MENULOGO/g, global.config.about.menulogo);
      indexhtml = indexhtml.replace(/XXX_BUILDNO/g, global.config.env.version);

      indexhtml = indexhtml.replace(/XXX_POSONLY/g, global.config.env.posonly);

      indexhtml = indexhtml.replace(/XXX_FAVICO16/g, global.config.env.favico16);
      indexhtml = indexhtml.replace(/XXX_FAVICO32/g, global.config.env.favico32);

      indexhtml = indexhtml.replace(/XXX_META_TITLE/g, global.config.meta.title);
      indexhtml = indexhtml.replace(/XXX_META_DESCRIPTION/g, global.config.meta.description);
      indexhtml = indexhtml.replace(/XXX_META_KEYWORDS/g, global.config.meta.keywords);
      indexhtml = indexhtml.replace(/XXX_META_REPLYTO/g, global.config.meta.replyto);
      indexhtml = indexhtml.replace(/XXX_META_COPYRIGHT/g, global.config.meta.copyright);

      indexhtml = indexhtml.replace(/XXX_GOOGLEWEBKEY/g, global.config.google.webkey);
      indexhtml = indexhtml.replace(/XXX_GOOGLEDEFAULTREGION/g, global.config.google.defaultregion);

      indexhtml = indexhtml.replace(/XXX_PAYDAYOFWEEK/g, global.config.defaults.defaultpaydow);
      indexhtml = indexhtml.replace(/XXX_DEFAULTCOUNTRY/g, global.config.defaults.defaultcountry);
      indexhtml = indexhtml.replace(/XXX_DEFAULTMAXHISTORY/g, global.config.defaults.defaultmaxhistory);

      indexhtml = indexhtml.replace(/XXX_ITYPE_ORDER_ORDER/g, global.config.defaults.itype_order_order);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ORDER_INVOICE/g, global.config.defaults.itype_order_invoice);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ORDER_QUOTE/g, global.config.defaults.itype_order_quote);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ORDER_DELIVERYDOCKET/g, global.config.defaults.itype_order_deliverydocket);

      indexhtml = indexhtml.replace(/XXX_ITYPE_INVENTORY_XFER/g, global.config.defaults.itype_inventory_xfer);
      indexhtml = indexhtml.replace(/XXX_ITYPE_INVENTORY_ADJUST/g, global.config.defaults.itype_inventory_adjust);
      indexhtml = indexhtml.replace(/XXX_ITYPE_INVENTORY_ORDER/g, global.config.defaults.itype_inventory_order);
      indexhtml = indexhtml.replace(/XXX_ITYPE_INVENTORY_STOCK/g, global.config.defaults.itype_inventory_stock);
      indexhtml = indexhtml.replace(/XXX_ITYPE_INVENTORY_BUILD/g, global.config.defaults.itype_inventory_build);

      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_ASSET/g, global.config.defaults.itype_account_asset);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_EXPENSE/g, global.config.defaults.itype_account_expense);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_LIABILITY/g, global.config.defaults.itype_account_liability);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_EQUITY/g, global.config.defaults.itype_account_equity);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_REVENUE/g, global.config.defaults.itype_account_revenue);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_COSTOFGOODSSOLD/g, global.config.defaults.itype_account_costofgoodssold);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_OTHERREVENUE/g, global.config.defaults.itype_account_otherrevenue);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_OTHEREXPENSES/g, global.config.defaults.itype_account_otherexpenses);
      indexhtml = indexhtml.replace(/XXX_ITYPE_ACCOUNT_BANK/g, global.config.defaults.itype_account_bank);

      indexhtml = indexhtml.replace(/XXX_ERRCODE_NONE/g, global.config.errorcodes.errcode_none);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_NODATA/g, global.config.errorcodes.errcode_nodata);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_MISSINGPARAMS/g, global.config.errorcodes.errcode_missingparams);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_FATAL/g, global.config.errorcodes.errcode_fatal);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_NOTLOGGEDIN/g, global.config.errorcodes.errcode_notloggedin);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_SESSIONEXPIRED/g, global.config.errorcodes.errcode_sessionexpired);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_RESOURCEUNAVAIL/g, global.config.errorcodes.errcode_resourceunavail);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_DBUNAVAIL/g, global.config.errorcodes.errcode_dbunavail);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_USEREXISTS/g, global.config.errorcodes.errcode_userexists);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_DBERR/g, global.config.errorcodes.errcode_dberr);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_FILEERR/g, global.config.errorcodes.errcode_fileerr);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_USERNOTREGISTERED/g, global.config.errorcodes.errcode_usernotregistered);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_PASSWDHASH/g, global.config.errorcodes.errcode_passwdhash);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_INVALIDCONNECTION/g, global.config.errorcodes.errcode_invalidconnection);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_INVALIDLOGIN/g, global.config.errorcodes.errcode_invalidlogin);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_MISSINGURL/g, global.config.errorcodes.errcode_missingurl);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_SMSERROR/g, global.config.errorcodes.errcode_smserror);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_INVALIDSESSION/g, global.config.errorcodes.errcode_invalidsession);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_INVALIDCLIENT/g, global.config.errorcodes.errcode_invalidclient);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_UNABLERESTORESESSION/g, global.config.errorcodes.errcode_unablerestoresession);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_COMMITTX/g, global.config.errorcodes.errcode_committx);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_JSONPARSE/g, global.config.errorcodes.errcode_jsonparse);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_JSONSTRINGIFY/g, global.config.errorcodes.errcode_jsonstringify);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_UNABLECREATENEWUSER/g, global.config.errorcodes.errcode_unablecreatenewuser);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_UNABLELOGINUSER/g, global.config.errorcodes.errcode_unableloginuser);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_UNABLESAVECLIENT/g, global.config.errorcodes.errcode_unablesaveclient);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_UNABLESAVEPRODUCT/g, global.config.errorcodes.errcode_unablesaveproduct);
      indexhtml = indexhtml.replace(/XXX_ERRCODE_INSUFFICIENTQTY/g, global.config.errorcodes.errcode_insufficientqty);

      indexhtml = indexhtml.replace(/XXX_BARCODE_FORMAT/g, global.config.barcodes.format);
      indexhtml = indexhtml.replace(/XXX_BARCODE_LENGTH/g, global.config.barcodes.length);
      indexhtml = indexhtml.replace(/XXX_BARCODE_PREFIX_LENGTH/g, global.config.barcodes.prefixlength);

      indexhtml = indexhtml.replace(/XXX_AVATARS/g, avatars);

      indexhtml = indexhtml.replace(/XXX_ABNLOOKUP/g, global.config.gov.abnlookup);

      indexhtml = indexhtml.replace(/XXX_VOICEPREFIXNAME/g, global.config.voice.prefixname);

      res.send(indexhtml);
    }
  );

  app.get
  (
    '/voices.js',
    function(req, res)
    {
      var jsobj = global.fs.readFileSync(global.path.join(__dirname, 'routes/voices.js'));
      var js = jsobj.toString();

      js = js.replace(/XXX_VOICEPREFIXNAME/g, global.config.voice.prefixname);

      res.send(js);
    }
  );

  // Fetch attachments...
  app.get
  (
    '/throworderattachment',
    function(req, res)
    {
      throworderattachments.throwOrderAttachmentGet(req, res);
    }
  );

  app.get
  (
    '/throwclientattachment',
    function(req, res)
    {
      throwclientattachments.throwClientAttachmentGet(req, res);
    }
  );

  app.get
  (
    '/throwsupplierattachment',
    function(req, res)
    {
      throwsupplierattachments.throwSupplierAttachmentGet(req, res);
    }
  );

  app.get
  (
    '/throwprinttemplate',
    function(req, res)
    {
      throwprinttemplates.throwPrintTemplateGet(req, res);
    }
  );

  // This line is last for static files...
  app.use('/', express.static(__dirname + '/routes'));

  // Load connection cache (uuids)....
  global.modauth.InitConnectionCache();

  // *******************************************************************************************************************************************************************************************
  // Primus stuff...
  primus.prototype.sendToRoom = function(room, eventname, data)
  {
    // primus-emit doesn't extend to primus-redis-rooms, so we mimic it's internals (the emit) data format...
    this.room(room).write({emit: [eventname, data]});
  };

  primus.prototype.sendToRoomExcept = function(room, eventname, data, sparkid)
  {
    var r = this.room(room);

    r.sparks.forEach
    (
      function(s)
      {
        if (s.id != sparkid)
          s.emit(eventname, data);
      }
    );
  };

  primus.prototype.numConnections = function()
  {
    var count = 0;
    this.forEach
    (
      function(spark, id, connections)
      {
        count++;
      }
    );
    return count;
  };

  global.ConsoleLog('========== Primus server starting...');
  global.pr = new primus
  (
    server,
    {
      transformer: global.config.primus.transformer,
      pathname: global.config.primus.pathname,
      redis:
      {
        host: global.config.redis.rHost,
        port: global.config.redis.rPort,
        channel: global.config.redis.rChannel
      }
    }
  );

  global.pr.use('redis', prrooms);
  global.pr.use('emitter', pe);

  global.pr.on
  (
    'close',
    function()
    {
    }
  );

  global.pr.on
  (
    'connection',
    function(spark)
    {
      // Give client a unique (for this lifetime) fake GUID... (fake because we don't have access to a NIC)...
      // Client must pass this around on every query so we can target back responses...
      // var fguid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16);});
      var fguid = uuidv4();

      spark.myUuid = '';
      // Automatically join them to the initial broadcast channel...
      spark.myChannels = [global.config.env.notificationschannel];
      spark.join(global.config.env.notificationschannel);

      global.log.info({as1: true}, '[connect] from: ' + spark.address.ip + ':' + spark.address.port);
      global.ConsoleLog('[connect] from: ' + spark.address.ip + ':' + spark.address.port);

      function addListener(eventname, aliaseventname, func, params)
      {
        spark.on
        (
          eventname,
        function(data)
          {
            try
            {
              makeWorld2(spark, aliaseventname, data, params).then
              (
                function(world)
                {
                  func(world);
                }
              ).then
              (
                null,
                function(ignore)
                {
                }
              );
            }
    
            catch (err)
            {
              global.log.error({as1: true}, '[' + eventname + '] ' + global.text_generalexception + ' ' + err.message);
            }
          }
        );
      }
    
      // *******************************************************************************************************************************************************************************************
      // Auth/connection events
      spark.on
      (
        'error',
        function(err)
        {
        }
      );

      spark.on
      (
        'end',
        function()
        {
          try
          {
            // Leave channels...
            spark.leaveAll();
            spark.myChannels = [];

            if (!__.isUndefined(spark.myUuid) && !__.isNull(spark.myUuid) && !__.isBlank(spark.myUuid))
            {
              // Find this user in redis and update status...
              global.users.get
              (
                global.config.redis.prefix + spark.myUuid,
                function(err, uuidobj)
                {
                  if (!err)
                  {
                    global.safejsonparse
                    (
                      uuidobj,
                      function(err, uo)
                      {
                        if (!err)
                        {
                          global.ConsoleLog('========== end: fguid: ' + uo.fguid + ', uuid: ' + spark.myUuid + ', session: ' + uo.session + ', name: ' + uo.uname);

                          global.safejsonstringify
                          (
                            uo,
                            function(err, json)
                            {
                              if (!err)
                                global.users.set(global.config.redis.prefix + spark.myUuid, json);
                            }
                          );

                          global.pr.sendToRoom(global.config.env.notificationschannel, 'useroffline', {uuid: spark.myUuid, uname: uo.uname});

                          uo.fguid = '';
                          uo.sparkid = null;
                        }
                        else
                          global.log.error({as1: true}, '[end] ' + err.message + ' ' + uuidobj);
                      }
                    );
                  }
                  else
                    global.log.info({as1: true}, '[end] ' + global.text_generalexception + ' unable to retrieve uuid [' + spark.uuid + '] for disconnection');
                }
              );
            }
            else
            {
              // Usually means user cancelled login - so we don't have a UUID yet for this spark... or user has explicitl logged out...
              //global.log.error({as1: true}, '[end] Unknown spark UUID...');
            }
          }

          catch (err)
          {
            global.log.error({as1: true}, '[end] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'login',
        function(data)
        {
          try
          {
            global.modauth.LoginUser(spark, 'login', data.fguid, data.uid, data.pwd, data.pdata);
          }

          catch (err)
          {
            global.log.error({as1: true}, '[login] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'logout',
        function(data)
        {
          try
          {
            global.modauth.LogoutUser(spark, 'logout', data.fguid, data.pdata);
          }

          catch (err)
          {
            global.log.error({as1: true}, '[logout] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      spark.on
      (
        'join',
        function(data)
        {
          try
          {
            if (!__.isUndefined(data.fguid) && !__.isUndefined(data.channel) && !__.isNull(data.channel))
            {
              if (spark.myChannels.indexOf(data.channel) == -1)
              {
                spark.join(data.channel);
                spark.myChannels.push(data.channel);
              }
              //
              spark.emit
              (
                'join',
                {
                  rc: global.errcode_none,
                  fguid: data.fguid,
                  channel: data.channel,
                  pdata: data.pdata
                }
              );
            }
          }

          catch (err)
          {
            global.log.error({as1: true}, '[join] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      addListener
      (
        'sessionhint',
        'sessionhint',
        function(world)
        {
          // NOP - makeWorld has done all the work restoring and associating the user cache and spark...
          // but we need to return user's channels...

          // Find user in cache...
          global.users.get
          (
            global.config.redis.prefix + data.uuid,
            function(err, uuidobj)
            {
              if (!err)
              {
                global.safejsonparse
                (
                  uuidobj,
                  function(err, uo)
                  {
                    if (!err)
                      spark.emit('sessionhint', {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, channels: uo.channels, pdata: world.pdata});
                  }
                );
              }
            }
          );
        },
        []
      );

      addListener('register', 'register', global.modauth.RegisterRep, ['repcode', 'name', 'password', 'email', 'mobile']);

      // *******************************************************************************************************************************************************************************************
      // ALL requests need at least:
      //   fguid - from initial connection which will be echoed...
      //   uuid - login credentials which will be echoed...
      //   session - session credentials...
      //   pdata - private data which will be echoed back - useful for clients to track...
      //   Whatever params as required by the request...
      // Returns:
      //   rc - 0 success -1 no data/results but otherwise fine, -2 missing params, -3 error
      //   msg - error message or any textual message with the return code
      // Optional returns:
      //   rs - array of result set...
      //   Whatever else specific to that request...

      // Account requests
      addListener('listaccounts',                         'listaccounts',                         global.modaccounts.ListAccounts,                       []);
      addListener('loadaccount',                          'loadaccount',                          global.modaccounts.LoadAccount,                        ['accountid*']);
      addListener('newaccount',                           'newaccount',                           global.modaccounts.NewAccount,                         ['*name', '*code', '*accounttype', '*parentid']);
      addListener('saveaccount',                          'saveaccount',                          global.modaccounts.SaveAccount,                        ['*accountid', '*code', '*name', '*altcode', '*altname', '*accounttype']);
      addListener('changeaccountparent',                  'changeaccountparent',                  global.modaccounts.ChangeAccountParent,                ['*accountid', '*parentid']);
      addListener('expireaccount',                        'expireaccount',                        global.modaccounts.ExpireAccount,                      ['*accountid', '*cascade']);
      addListener('checkaccountcode',                     'checkaccountcode',                     global.modaccounts.CheckAccountCode,                   ['*accountid', '*code']);

      // Exchange rate requests
      addListener('listexchangerates',                    'listexchangerates',                    global.modxr.ListExchangeRates,                        []);
      addListener('newexchangerate',                      'newexchangerate',                      global.modxr.NewExchangeRate,                          ['*name']);
      addListener('saveexchangerate',                     'saveexchangerate',                     global.modxr.SaveExchangeRate,                         ['*exchangerateid', '*name', '*currency', '*rate', '*provider']);
      addListener('expireexchangerate',                   'expireexchangerate',                   global.modxr.ExpireExchangeRate,                       ['*exchangerateid']);
      addListener('latestrates',                          'latestrates',                          global.modxr.LatestRates,                              []);

      // Taxcode requests
      addListener('listtaxcodes',                         'listtaxcodes',                         global.modaccounts.ListTaxCodes,                       []);
      addListener('loadtaxcode',                          'loadtaxcode',                          global.modaccounts.LoadTaxCode,                        ['*taxcodeid']);
      addListener('newtaxcode',                           'newtaxcode',                           global.modaccounts.NewTaxCode,                         ['*name', '*code', '*percent']);
      addListener('savetaxcode',                          'savetaxcode',                          global.modaccounts.SaveTaxCode,                        ['*taxcodeid', '*code', '*name', '*percent']);
      addListener('expiretaxcode',                        'expiretaxcode',                        global.modaccounts.ExpireTaxCode,                      ['*taxcodeid']);
      addListener('checktaxcode',                         'checktaxcode',                         global.modaccounts.CheckTaxCode,                       ['*taxcodeid', '*code']);

      // Journal requests
      addListener('listjournals',                         'listjournals',                         global.modjournals.ListJournals,                       []);
      addListener('newjournal',                           'newjournal',                           global.modjournals.NewJournal,                         ['*type', '*entries', 'refno', 'comments']);
      addListener('testjournal',                          'testjournal',                          global.modjournals.TestJournal,                        []);

      // Location requests
      addListener('listlocations',                        'listlocations',                        global.modlocations.ListLocations,                     []);
      addListener('loadlocation',                         'loadlocation',                         global.modlocations.LoadLocation,                      ['*locationid']);
      addListener('newlocation',                          'newlocation',                          global.modlocations.NewLocation,                       ['*parentid', '*code', '*name', 'gpslat', 'gpslon', 'address1', 'address2', 'city', 'state', 'postcode', 'country', 'attrib1', 'attrib2', 'attrib3', 'attrib4', 'attrib5', 'bay', 'level', 'shelf']);
      addListener('savelocation',                         'savelocation',                         global.modlocations.SaveLocation,                      ['*locationid', '*code', '*name', 'gpslat', 'gpslon', 'address1', 'address2', 'city', 'state', 'postcode', 'country', 'attrib1', 'attrib2', 'attrib3', 'attrib4', 'attrib5', 'bay', 'level', 'shelf']);
      addListener('changelocationparent',                 'changelocationparent',                 global.modlocations.ChangeLocationParent,              ['*locationid', '*parentid']);
      addListener('expirelocation',                       'expirelocation',                       global.modlocations.ExpireLocation,                    ['*locationid', '*cascade']);
      addListener('checklocationcode',                    'checklocationcode',                    global.modlocations.CheckLocationCode,                 ['*locationid', '*code']);

      // Client requests
      addListener('listclients',                          'listclients',                          global.modclients.ListClients,                         ['showinactive']);
      addListener('loadclient',                           'loadclient',                           global.modclients.LoadClient,                          ['*clientid']);
      addListener('newclient',                            'newclient',                            global.modclients.NewClient,                           ['*parentid', '*name', 'code', 'email1', 'url1', 'contact1', 'phone1', 'address1', 'address2', 'address3', 'address4', 'city', 'state', 'postcode', 'country', 'contact2', 'phone2', 'shiptoaddress1', 'shiptoaddress2', 'shiptoaddress3', 'shiptoaddress4', 'shiptocity', 'shiptostate', 'shiptopostcode', 'shiptocountry', 'contact3', 'contact4', 'mobile3', 'mobile4', 'phone3', 'phone4', 'fax3', 'bankname', 'bankbsb', 'bankaccountno', 'bankaccountname', 'dayscredit', 'linelimit', 'orderlimit', 'creditlimit', 'invoicetemplateid', 'ordertemplateid', 'quotetemplateid', 'labeltemplateid', 'isactive', 'issupplier', 'isclient', 'acn', 'abn', 'hscode', 'custcode1', 'custcode2']);
      addListener('saveclient',                           'saveclient',                           global.modclients.SaveClient,                          ['*clientid', '*parentid', '*name', 'code', 'email1', 'url1', 'contact1', 'phone1', 'address1', 'address2', 'address3', 'address4', 'city', 'state', 'postcode', 'country', 'contact2', 'phone2', 'shiptoaddress1', 'shiptoaddress2', 'shiptoaddress3', 'shiptoaddress4', 'shiptocity', 'shiptostate', 'shiptopostcode', 'shiptocountry', 'contact3', 'contact4', 'mobile3', 'mobile4', 'phone3', 'phone4', 'fax3', 'bankname', 'bankbsb', 'bankaccountno', 'bankaccountname', 'dayscredit', 'linelimit', 'orderlimit', 'creditlimit', 'invoicetemplateid', 'ordertemplateid', 'quotetemplateid', 'labeltemplateid', 'isactive', 'issupplier', 'isclient', 'acn', 'abn', 'hscode', 'custcode1', 'custcode2']);
      addListener('changeclientparent',                   'changeclientparent',                   global.modclients.ChangeClientParent,                  ['*clientid', '*parentid']);
      addListener('expireclient',                         'expireclient',                         global.modclients.ExpireClient,                        ['*clientid', '*cascade']);
      addListener('checkclientcode',                      'checkclientcode',                      global.modclients.CheckClientCode,                     ['*clientid', '*code']);
      addListener('searchclients',                        'listclients',                          global.modclients.SearchClients,                       ['code', 'name', 'email', 'phone', 'contact', 'datefrom', 'dateto', 'maxhistory']);
      addListener('listemails',                           'listemails',                           global.modclients.ListEmails,                          ['*clientid']);

      // Client note requests
      addListener('listclientnotes',                      'listclientnotes',                      global.modclients.ListClientNotes,                     ['*clientid']);
      addListener('newclientnote',                        'newclientnote',                        global.modclients.NewClientNote,                       ['*clientid']);
      addListener('saveclientnote',                       'saveclientnote',                       global.modclients.SaveClientNote,                      ['*clientnoteid', 'notes']);
      addListener('expireclientnote',                     'expireclientnote',                     global.modclients.ExpireClientNote,                    ['*clientnoteid']);
      addListener('searchclientnote',                     'searchclientnote',                     global.modclients.SearchClientNote,                    ['*clientid', '*words']);

      // Client attachment requests
      addListener('listclientattachments',                'listclientattachments',                global.modclients.ListClientAttachments,               ['*clientid']);
      addListener('saveclientattachment',                 'saveclientattachment',                 global.modclients.SaveClientAttachment,                ['*clientattachmentid', '*description']);
      addListener('expireclientattachment',               'expireclientattachment',               global.modclients.ExpireClientAttachment,              ['*clientattachmentid']);

      // Supplier requests
      addListener('listsuppliers',                        'listsuppliers',                        global.modsuppliers.ListSuppliers,                     ['showinactive']);
      addListener('loadsupplier',                         'loadsupplier',                         global.modsuppliers.LoadSupplier,                      ['*supplierid']);
      addListener('newsupplier',                          'newsupplier',                          global.modsuppliers.NewSupplier,                       ['*parentid', '*name', 'code', 'url1', 'email1', 'phone1', 'fax1', 'contact1', 'address1', 'address2', 'address3', 'address4', 'city', 'state', 'postcode', 'country', 'contact2', 'shipaddress1', 'shipaddress2', 'shipaddress3', 'shipaddress4', 'shipcity', 'shipstate', 'shippostcode', 'shipcountry', 'bankname', 'bankbsb', 'bankaccountno', 'bankaccountname', 'dayscredit', 'linelimit', 'orderlimit', 'creditlimit', 'invoicetemplateid', 'ordertemplateid', 'quotetemplateid', 'deliverydockettemplateid', 'labeltemplateid', 'isactive', 'acn', 'abn', 'hscode', 'custcode1', 'custcode2', 'costofgoodsaccountid', 'incomeaccountid', 'expenseaccountid', 'assetaccountid']);
      addListener('savesupplier',                         'savesupplier',                         global.modsuppliers.SaveSupplier,                      ['*supplierid', '*name', 'code', 'url1', 'email1', 'phone1', 'fax1', 'contact1', 'address1', 'address2', 'address3', 'address4', 'city', 'state', 'postcode', 'country', 'contact2', 'shipaddress1', 'shipaddress2', 'shipaddress3', 'shipaddress4', 'shipcity', 'shipstate', 'shippostcode', 'shipcountry', 'bankname', 'bankbsb', 'bankaccountno', 'bankaccountname', 'dayscredit', 'linelimit', 'orderlimit', 'creditlimit', 'invoicetemplateid', 'ordertemplateid', 'quotetemplateid', 'deliverydockettemplateid', 'labeltemplateid', 'isactive', 'acn', 'abn', 'hscode', 'custcode1', 'custcode2', 'costofgoodsaccountid', 'incomeaccountid', 'expenseaccountid', 'assetaccountid']);
      addListener('changesupplierparent',                 'changesupplierparent',                 global.modsuppliers.ChangeSupplierParent,              ['*supplierid', '*parentid']);
      addListener('expiresupplier',                       'expiresupplier',                       global.modsuppliers.ExpireSupplier,                    ['*supplierid', '*cascade']);
      addListener('checksuppliercode',                    'checksuppliercode',                    global.modsuppliers.CheckSupplierCode,                 ['*supplierid', '*code']);

      // Supplier note requests
      addListener('listsuppliernotes',                    'listsuppliernotes',                    global.modsuppliers.ListSupplierNotes,                 ['*supplierid']);
      addListener('newsuppliernote',                      'newsuppliernote',                      global.modsuppliers.NewSupplierNote,                   ['*supplierid']);
      addListener('savesuppliernote',                     'savesuppliernote',                     global.modsuppliers.SaveSupplierNote,                  ['*suppliernoteid', 'notes']);

      // Supplier attachment requests
      addListener('listsupplierattachments',              'listsupplierattachments',              global.modsuppliers.ListSupplierAttachments,           ['*supplierid']);
      addListener('savesupplierattachment',               'savesupplierattachment',               global.modsuppliers.ListSupplierNotes,                 ['*supplierattachmentid', '*description']);
      addListener('expiresupplierattachment',             'expiresupplierattachment',             global.modsuppliers.ExpireSupplierAttachment,          ['*supplierattachmentid']);

      // Employee requests
      addListener('listemployees',                        'listemployees',                        global.modemployees.ListEmployees,                     []);
      addListener('loademployee',                         'loademployee',                         global.modemployees.LoadEmployee,                      ['*employeeid']);
      addListener('newemployee',                          'newemployee',                          global.modemployees.NewEmployee,                       ['*parentid', '*lastname', '*firstname', 'title', 'code', 'altcode', 'email1', 'phone1', 'address1', 'address2', 'city', 'state', 'postcode', 'country', 'bankname', 'bankbsb', 'bankaccountno', 'bankaccountname', 'dob', 'startdate', 'enddate', 'payamount', 'payrate', 'payfrequency', 'paystdperiod', 'wageaccountid', 'superfundid', 'taxfileno', 'taxtable', 'employmenttype', 'employmentstatus', 'overtimeallowed', 'workhours', 'gender']);
      addListener('saveemployee',                         'saveemployee',                         global.modemployees.SaveEmployee,                      ['*employeeid', '*lastname', '*firstname', 'title', 'code', 'altcode', 'email1', 'phone1', 'address1', 'address2', 'city', 'state', 'postcode', 'country', 'bankname', 'bankbsb', 'bankaccountno', 'bankaccountname', 'dob', 'startdate', 'enddate', 'payamount', 'payrate', 'payfrequency', 'paystdperiod', 'wageaccountid', 'superfundid', 'taxfileno', 'taxtable', 'employmenttype', 'employmentstatus', 'overtimeallowed', 'workhours', 'gender']);
      addListener('changeemployeeparent',                 'changeemployeeparent',                 global.modemployees.ChangeEmployeeParent,              ['*employeeid', '*parentid']);
      addListener('expireemployee',                       'expireemployee',                       global.modemployees.ExpireEmployee,                    ['*employeeid', '*cascade']);
      addListener('checkemployeecode',                    'checkemployeecode',                    global.modemployees.CheckEmployeeCode,                 ['*employeeid', '*code']);
 
      // User requests
      addListener('listusers',                            'listusers',                            global.modauth.ListUsers,                              []);
      addListener('listconnectedusers',                   'listconnectedusers',                   global.modauth.ListConnectedUsers,                     []);
      addListener('loaduser',                             'loaduser',                             global.modauth.LoadUser,                               ['*useruuid']);
      addListener('newuser',                              'newuser',                              global.modauth.NewUser,                                ['*name', '*uid', '*pwd', '*clientid', '*email', '*mobile', '*avatar', '*isadmin', 'isclient']);
      addListener('saveuser',                             'saveuser',                             global.modauth.SaveUser,                               ['*useruuid', '*name', '*uid', '*clientid', '*email', '*mobile', '*isadmin', '*avatar', '*isclient', '*clientid']);
      addListener('expireuser',                           'expireuser',                           global.modauth.ExpireUser,                             ['*useruuid']);
      addListener('checkuseruid',                         'checkuseruid',                         global.modauth.CheckUserUid,                           ['*useruuid', '*uid']);
      addListener('changepassword',                       'changepassword',                       global.modauth.ChangePassword,                         ['*useruuid', '*pwd']);
      addListener('saveuserpermissions',                  'saveuserpermissions',                  global.modauth.SaveUserPermissions,                    ['*useruuid', '*permissions']);
                                 
      // Config requests                                 
      addListener('listprinttemplates',                   'listprinttemplates',                   global.modconfig.ListPrintTemplates,                   []);
      addListener('saveprinttemplate',                    'saveprinttemplate',                    global.modconfig.SavePrintTemplate,                    ['*printtemplateid', '*description']);
      addListener('expireprinttemplate',                  'expireprinttemplate',                  global.modconfig.ExpirePrintTemplate,                  ['*printtemplateid']);
      addListener('loadconfig',                           'loadconfig',                           global.modconfig.LoadConfig,                           []);
      addListener('saveconfig',                           'saveconfig',                           global.modconfig.SaveConfig,                           ['*orderasquote', '*statusid', '*inventoryadjustaccountid', '*currentquoteno', '*currentorderno', '*currentporderno', '*currentinvoiceno', '*currentjournalno', '*currentclientno', '*currentsupplierno', '*currentempno', '*currentjobsheetno', '*currentbarcodeno', '*inventoryusefifo', '*expressfee', '*defaultinventorylocationid', '*gstpaidaccountid', '*gstcollectedaccountid', '*invoiceprinttemplateid', '*orderprinttemplateid', '*quoteprinttemplateid', '*deliverydocketprinttemplateid', '*araccountid', '*apaccountid', '*fyearstart', '*fyearend', '*companyname', '*address1', '*address2', '*address3', '*address4', '*city', '*state', '*postcode', '*country', '*bankname', '*bankbsb', '*bankaccountno', '*bankaccountname', '*productcostofgoodsaccountid', '*productincomeaccountid', '*productassetaccountid', '*productbuytaxcodeid', '*productselltaxcodeid', '*autosyncbuildtemplates', '*posclientid', 'attrib1name', 'attrib2name', 'attrib3name', 'attrib4name', 'attrib5name']);
      addListener('loademailtemplates',                   'loademailtemplates',                   global.modconfig.LoadEmailTemplates,                   []);
      addListener('saveemailtemplates',                   'saveemailtemplates',                   global.modconfig.SaveEmailTemplates,                   ['*emailordertemplate', '*emailinvoicetemplate', '*emailquotetemplate']);

      // Superfund requests
      addListener('listsuperfunds',                       'listsuperfunds',                       global.modaccounts.ListSuperfunds,                     []);
      addListener('newsuperfund',                         'newsuperfund',                         global.modaccounts.NewSuperfund,                       ['*name']);
      addListener('savesuperfund',                        'savesuperfund',                        global.modaccounts.SaveSuperfund,                      ['*superfundid', '*name']);
      addListener('expiresuperfund',                      'expiresuperfund',                      global.modaccounts.ExpireSuperfund,                    ['*superfundid']);
      addListener('checksuperfundname',                   'checksuperfundname',                   global.modaccounts.CheckSuperfundName,                 ['*name']);

      // Product category requests
      addListener('listproductcategories',                'listproductcategories',                global.modproducts.ListProductCategories,              []);
      addListener('loadproductcategory',                  'loadproductcategory',                  global.modproducts.LoadProductCategory,                ['*productcategoryid']);
      addListener('newproductcategory',                   'newproductcategory',                   global.modproducts.NewProductCategory,                 ['*code', '*name', '*parentid']);
      addListener('saveproductcategory',                  'saveproductcategory',                  global.modproducts.SaveProductCategory,                ['*productcategoryid', '*name', 'code']);
      addListener('changeproductcategoryparent',          'changeproductcategoryparent',          global.modproducts.ChangeProductCategoryParent,        ['*productcategoryid', '*parentid']);
      addListener('expireproductcategory',                'expireproductcategory',                global.modproducts.ExpireProductCategory,              ['*productcategoryid', '*cascade']);
      addListener('checkproductcategorycode',             'checkproductcategorycode',             global.modproducts.CheckProductCategoryCode,           ['*productcategoryid', '*code']);

      // Product requests
      addListener('listproducts',                         'listproducts',                         global.modproducts.ListProducts,                       ['showinactive']);
      addListener('listproductsbycategory',               'listproductsbycategory',               global.modproducts.ListProductsByCategory,             ['*productcategoryid']);
      addListener('loadproduct',                          'loadproduct',                          global.modproducts.LoadProduct,                        ['*productid']);
      addListener('newproduct',                           'newproduct',                           global.modproducts.NewProduct,                         ['*name', '*productcategoryid', '*code', '*name', 'altcode', 'barcode', 'costprice', 'uom', 'uomsize', 'clientid', 'isactive', 'buytaxcodeid', 'selltaxcodeid', 'costofgoodsaccountid', 'incomeaccountid', 'assetaccountid', 'buildtemplateid', 'minqty', 'warnqty', 'width', 'length', 'height', 'weight', 'price1', 'price2', 'price3', 'price4', 'price5', 'price6', 'price7', 'price8', 'price9', 'price10', 'price11', 'price12', 'atttrib1', 'attrib2', 'attrib3', 'attrib4', 'attrib5', 'productaliasid', 'location1id', 'location2id']);
      addListener('saveproduct',                          'saveproduct',                          global.modproducts.SaveProduct,                        ['*name', '*productid', '*code', '*name', 'altcode', 'barcode', 'costprice', 'uom', 'uomsize', 'clientid', 'isactive', 'buytaxcodeid', 'selltaxcodeid', 'costofgoodsaccountid', 'incomeaccountid', 'assetaccountid', 'buildtemplateid', 'minqty', 'warnqty', 'width', 'length', 'height', 'weight', 'price1', 'price2', 'price3', 'price4', 'price5', 'price6', 'price7', 'price8', 'price9', 'price10', 'price11', 'price12', 'attrib1', 'attrib2', 'attrib3', 'attrib4', 'attrib5', 'productaliasid', 'location1id', 'location2id']);
      addListener('changeproductcategory',                'changeproductcategory',                global.modproducts.ChangeProductCategory,              ['*productid', '*productcategoryid']);
      addListener('duplicateproduct',                     'duplicateproduct',                     global.modproducts.DuplicateProduct,                   ['*productid']);
      addListener('expireproduct',                        'expireproduct',                        global.modproducts.ExpireProduct,                      ['*productid']);
      addListener('checkproductcode',                     'checkproductcode',                     global.modproducts.CheckProductCode,                   ['*productid', '*code']);
      addListener('productsearch',                        'productsearch',                        global.modproducts.SearchProducts,                     ['*value']);

      // Product code requests
      addListener('listproductcodes',                     'listproductcodes',                     global.modproducts.ListProductCodes,                   ['*productid']);
      addListener('newproductcode',                       'newproductcode',                       global.modproducts.NewProductCode,                     ['*productid', '*code', 'barcode', 'supplierid']);
      addListener('expireproductcode',                    'expireproductcode',                    global.modproducts.ExpireProductCode,                  ['*productcodeid']);

      // Product pricing requests
      addListener('listproductpricing',                   'listproductpricing',                   global.modproducts.ListProductPricing,                 ['*productid']);
      addListener('newproductpricing',                    'newproductpricing',                    global.modproducts.NewProductPricing,                  ['*productid']);
      addListener('saveproductpricing',                   'saveproductpricing',                   global.modproducts.SaveProductPricing,                 ['*priceid', '*productid', '*price', 'clientid', 'minqty', 'maxqty', 'price1', 'price2', 'price3', 'price4', 'price5']);
      addListener('expireproductpricing',                 'expireproductpricing',                 global.modproducts.ExpireProductPricing,               ['*priceid']);

      // Build template requests
      addListener('listbuildtemplates',                   'listbuildtemplates',                   global.modproducts.ListBuildTemplates,                 []);
      addListener('listbuildtemplateroots',               'listbuildtemplateroots',               global.modproducts.ListBuildTemplateRoots,             []);
      addListener('buildtemplategetchildren',             'buildtemplategetchildren',             global.modproducts.BuildTemplateGetChildren,           []);
      addListener('newbuildtemplate',                     'newbuildtemplate',                     global.modproducts.NewBuildTemplate,                   ['*code', '*templates', 'clientid']);
      addListener('savebuildtemplate',                    'savebuildtemplate',                    global.modproducts.SaveBuildTemplate,                  ['*buildtemplateid', '*name', 'code', 'clientid', 'taxcodeid', 'price', 'qty']);
      addListener('changebuildtemplateparent',            'changebuildtemplateparent',            global.modproducts.ChangeBuildTemplateParent,          ['*buildtemplateid', '*parentid']);
      addListener('duplicatebuildtemplate',               'duplicatebuildtemplate',               global.modproducts.DuplicateBuildTemplate,             ['*buildtemplateid']);
      addListener('expirebuildtemplate',                  'expirebuildtemplate',                  global.modproducts.ExpireBuildTemplate,                ['*buildtemplateid', 'cascade']);
      addListener('buildbuildtemplate',                   'buildbuildtemplate',                   global.modproducts.BuildBuildTemplate,                 ['*buildtemplateid', '*productid', '*qty']);
      addListener('syncbuildtemplate',                    'syncbuildtemplate',                    global.modproducts.SyncBuildTemplate,                  ['*buildtemplateid']);
      addListener('syncbuildtemplatestomaster',           'syncbuildtemplatestomaster',           global.modproducts.SyncBuildTemplatesToMaster,         []);
      addListener('buildtemplatesearch',                  'buildtemplatesearch',                  global.modproducts.SearchBuildTemplates,               ['*value']);

      // Build template detail requests
      addListener('listproductsbybuildtemplate',          'listproductsbybuildtemplate',          global.modproducts.ListProductsByBuildTemplate,        ['*buildtemplateid']);
      addListener('listbuildproductsforbuild',            'listbuildproductsforbuild',            global.modproducts.ListBuildProductsForBuild,          ['*buildtemplateid']);
      addListener('newbuildtemplatedetail',               'newbuildtemplatedetail',               global.modproducts.NewBuildTemplateDetail,             ['*buildtemplateid', '*productid', '*qty', '*price']);
      addListener('savebuildtemplatedetail',              'savebuildtemplatedetail',              global.modproducts.SaveBuildTemplateDetail,            ['*buildtemplatedetailid', '*productid', 'price', 'qty', 'taxcodeid', 'pertemplateqty']);
      addListener('expirebuildtemplatedetail',            'expirebuildtemplatedetail',            global.modproducts.ExpireBuildTemplateDetail,          ['*buildtemplatedetailid']);
      addListener('checkbuildtemplatecode',               'checkbuildtemplatecode',               global.modproducts.CheckBuildTemplateCode,             ['*code']);

      // Product template requests
      addListener('listproducttemplates',                 'listproducttemplates',                 global.modproducts.ListProductTemplates,               []);
      addListener('newproducttemplate',                   'newproducttemplate',                   global.modproducts.NewProductTemplate,                 ['*name', '*parentid']);
      addListener('saveproducttemplate',                  'saveproducttemplate',                  global.modproducts.SaveProductTemplate,                ['*producttemplateid', '*name', 'code', 'clientid', 'taxcodeid', 'price', 'qty']);
      addListener('changeproducttemplateparent',          'changeproducttemplateparent',          global.modproducts.ChangeProductTemplateParent,        ['*producttemplateid', '*parentid']);
      addListener('duplicateproducttemplate',             'duplicateproducttemplate',             global.modproducts.DuplicateProductTemplate,           ['*producttemplateid']);
      addListener('expireproducttemplate',                'expireproducttemplate',                global.modproducts.ExpireProductTemplate,              ['*producttemplateid', 'cascade']);
      addListener('buildproducttemplate',                 'buildproducttemplate',                 global.modproducts.BuildProductTemplate,               ['*producttemplateid', '*productid', '*qty']);
      addListener('syncproducttemplate',                  'syncproducttemplate',                  global.modproducts.SyncProductTemplate,                ['*producttemplateid']);

      // Product template detail requests
      addListener('listproductsbytemplate',               'listproductsbytemplate',               global.modproducts.ListProductsByTemplate,             ['*producttemplateid']);
      addListener('listproductsforbuild',                 'listproductsforbuild',                 global.modproducts.ListProductsForBuild,               ['*buildtemplateid']);
      addListener('newproducttemplatedetail',             'newproducttemplatedetail',             global.modproducts.NewProductTemplateDetail,           ['*producttemplateid', '*productid', '*qty', '*price']);
      addListener('saveproducttemplatedetail',            'saveproducttemplatedetail',            global.modproducts.SaveProductTemplateDetail,          ['*producttemplatedetailid', '*productid', 'price', 'qty', 'taxcodeid', 'pertemplateqty']);
      addListener('expireproducttemplatedetail',          'expireproducttemplatedetail',          global.modproducts.ExpireProductTemplateDetail,        ['*producttemplatedetailid']);

      // Product pricing requests
      addListener('getproductprices',                     'getproductprices',                     global.modproducts.GetProductPrices,                   ['*productid']);
      addListener('getprice',                             'getprice',                             global.modproducts.GetPrice,                           ['*productid', 'clientid', 'qty']);

      // Printing requests
      addListener('printinvoices',                        'printinvoices',                        global.modprinting.PrintInvoices,                      ['*orders']);
      addListener('printorders',                          'printorders',                          global.modprinting.PrintOrders,                        ['*orders']);
      addListener('printdeliverydockets',                 'printdeliverydockets',                 global.modprinting.PrintDeliveryDockets,               ['*orders']);
      addListener('printquotes',                          'printquotes',                          global.modprinting.PrintQuotes,                        ['*orders']);
      addListener('emailorder',                           'emailorder',                           global.modprinting.EmailOrder,                         ['*orderid', '*recipients', '*subject', '*message']);
      addListener('emailinvoice',                         'emailinvoice',                         global.modprinting.EmailInvoice,                       ['*orderid', '*recipients', '*subject', '*message']);

      // POrder requests
      addListener('listporders',                          'listporders',                          global.modporders.ListPOrders,                         []);
      addListener('loadporder',                           'loadporder',                           global.modporders.LoadPOrder,                          ['*porderid']);
      addListener('newpordersupplier',                    'newporder',                            global.modporders.NewPOrderSupplier,                   ['*name', '*supplierid', 'refno', 'invoiceno', 'invoicetoname', 'invoicetoaddress1', 'invoicetoaddress2', 'invoicetoaddress3', 'invoicetoaddress4', 'invoicetocity', 'invoicetostate', 'invoicetopostcode', 'invoicetocountry', 'shiptoname', 'shiptoaddress1', 'shiptoaddress2', 'shiptoaddress3', 'shiptoaddress4', 'shiptocity', 'shiptostate', 'shiptopostcode', 'shiptocountry', '*products']);
      addListener('savepordersupplier',                   'saveporder',                           global.modporders.SavePOrderSupplier,                  ['*porderid', '*name', '*supplierid', 'refno', 'invoiceno', 'invoicetoname', 'invoicetoaddress1', 'invoicetoaddress2', 'invoicetoaddress3', 'invoicetoaddress4', 'invoicetocity', 'invoicetostate', 'invoicetopostcode', 'invoicetocountry', 'shiptoname', 'shiptoaddress1', 'shiptoaddress2', 'shiptoaddress3', 'shiptoaddress4', 'shiptocity', 'shiptostate', 'shiptopostcode', 'shiptocountry', '*products']);
      addListener('searchporders',                        'searchporders',                        global.modporders.SearchPOrders,                       ['porderno', 'name', 'suppliers', 'postcode', 'city', 'country', 'state', 'datefrom', 'dateto', 'maxhistory']);
      addListener('expireporder',                         'expireporder',                         global.modporders.ExpirePOrder,                        ['*porderid']);
      addListener('completeporder',                       'completeporder',                       global.modporders.CompletePOrder,                      ['*porderid']);

      // POrder detail requests
      addListener('listporderdetails',                    'listporderdetails',                    global.modporders.ListPOrderDetails,                   ['*porderid']);

      // Order requests
      addListener('listorders',                           'listorders',                           global.modorders.ListOrders,                           []);
      addListener('loadorder',                            'loadorder',                            global.modorders.LoadOrder,                            ['*orderid']);
      addListener('neworder',                             'neworder',                             global.modorders.NewOrder,                             ['*isquote', '*clientid', '*name', '*products', 'pono', 'invoicetoname', 'address1', 'address2', 'address3', 'address4', 'city', 'state', 'postcode', 'country', 'shiptoname', 'shiptoaddress1', 'shiptoaddress2', 'shiptoaddress3', 'shiptoaddress4', 'shiptocity', 'shiptostate', 'shiptopostcode', 'shiptocountry', 'shiptonote', 'quotetemplateid', 'ordertemplateid', 'invoicetemplateid', 'isrepeat', 'startdate', 'enddate', 'freightprice']);
      addListener('saveorder',                            'saveorder',                            global.modorders.SaveOrder,                            ['*orderid', '*clientid', '*name', 'pono', 'activeversion', 'startdate', 'enddate', 'invoicetoname', 'address1', 'address2', 'address3', 'address4', 'city', 'state', 'postcode', 'country', 'shiptoname', 'shiptoaddress1', 'shiptoaddress2', 'shiptoaddress3', 'shiptoaddress4', 'shiptocity', 'shiptostate', 'shiptopostcode', 'shiptocountry', 'shiptonote', 'quotetemplateid', 'ordertemplateid', 'invoicetemplateid', 'isrepeat', 'freightprice']);
      addListener('duplicateorder',                       'duplicateorder',                       global.modorders.DuplicateOrder,                       ['*isquote', '*orderid']);
      addListener('expireorder',                          'expireorder',                          global.modorders.ExpireOrder,                          ['*orderid']);
      addListener('checkorderpo',                         'checkorderpo',                         global.modorders.CheckPONo,                            ['*orderid', '*pono']);
      addListener('newversionorder',                      'newversionorder',                      global.modorders.NewVersionOrder,                      ['*orderid', '*version']);
      addListener('searchorders',                         'listorders',                           global.modorders.SearchOrders,                         ['orderno', 'pono', 'name', 'version', 'clients', 'shippostcode', 'shipcity', 'shipcountry', 'shipstate', 'status', 'datefrom', 'dateto', 'maxhistory']);
      addListener('createinvoicefromorder',               'createinvoicefromorder',               global.modorders.CreateInvoice,                        ['*orderid']);
      addListener('orderpay',                             'orderpay',                             global.modorders.OrderPay,                             ['*orderid', '*amount']);

      // Quote requests
      addListener('listquotes',                           'listquotes',                           global.modorders.ListQuotes,                           []);
      addListener('searchquotes',                         'listquotes',                           global.modorders.SearchQuotes,                         ['quoteno', 'pono', 'name', 'version', 'clients', 'shippostcode', 'shipcity', 'shipcountry', 'shipstate', 'status', 'datefrom', 'dateto', 'maxhistory']);

      // Order note requests
      addListener('listordernotes',                       'listordernotes',                       global.modorders.ListOrderNotes,                       ['*orderid']);
      addListener('newordernote',                         'newordernote',                         global.modorders.NewOrderNote,                         ['*orderid']);
      addListener('saveordernote',                        'saveordernote',                        global.modorders.SaveOrderNote,                        ['*ordernoteid', 'notes']);
      addListener('expireorderote',                       'expireorderote',                       global.modorders.RemoveOrderNote,                      ['*ordernoteid']);
      addListener('searchordernote',                      'searchordernote',                      global.modorders.SearchOrderNote,                      ['*orderid', '*words']);

      // Order status requests
      addListener('listorderstatuses',                    'listorderstatuses',                    global.modorders.ListOrderStatuses,                    ['*orderid']);
      addListener('neworderstatus',                       'neworderstatus',                       global.modorders.NewOrderStatus,                       ['*orderid', '*status', 'connote', 'carriername', 'comment', 'batchno']);

      // Order attachment requests
      addListener('listorderattachments',                 'listorderattachments',                 global.modtpcc.ListOrderAttachments,                   ['*orderid']);
      addListener('saveorderattachment',                  'saveorderattachment',                  global.modtpcc.SaveOrderAttachment,                    ['*orderattachmentid', '*description', '*isthumbnail']);
      addListener('expireorderattachment',                'expireorderattachment',                global.modtpcc.ExpireOrderAttachment,                  ['*orderattachmentid']);
      addListener('getorderthumbnail',                    'getorderthumbnail',                    global.modtpcc.GetOrderThumbnail,                      ['*orderid']);

      // Order detail requests
      addListener('listorderdetails',                     'listorderdetails',                     global.modorders.ListOrderDetails,                     ['*orderid', '*version']);
      addListener('neworderdetail',                       'neworderdetail',                       global.modorders.NewOrderDetail,                       ['*orderid', '*version', '*productid', '*qty', '*price', '*discount', '*expressfee']);
      addListener('saveorderdetail',                      'saveorderdetail',                      global.modorders.SaveOrderDetail,                      ['orderdetailid', '*productid', '*price', '*qty', '*discount', '*expressfee', '*version', 'isrepeat', 'isnewartwork']);
      addListener('expireorderdetail',                    'expireorderdetail',                    global.modorders.ExpireOrderDetail,                    ['*orderdetailid']);

      // Status alert requests
      addListener('liststatusalerts',                     'liststatusalerts',                     global.modalerts.ListStatusAlerts,                     ['maxhistory']);
      addListener('loadstatusalert',                      'loadstatusalert',                      global.modalerts.LoadStatusAlert,                      ['*orderstatusalertid']);
      addListener('newstatusalert',                       'newstatusalert',                       global.modalerts.NewStatusAlert,                       ['*useruuid', '*statusalertid', 'email', 'mobile']);
      addListener('savestatusalert',                      'savestatusalert',                      global.modalerts.SaveStatusAlert,                      ['*orderstatusalertid', '*statusalertid', '*useruuid', 'email', 'mobile']);
      addListener('savestatusalert',                      'savestatusalert',                      global.modalerts.SaveStatusAlert,                      ['*orderstatusalertid', '*statusalertid', '*useruuid', 'email', 'mobile']);
      addListener('expirestatusalert',                    'expirestatusalert',                    global.modalerts.ExpireStatusAlert,                    ['*statusalertid']);

      // Invoice requests
      addListener('listinvoices',                         'listinvoices',                         global.modinvoices.ListInvoices,                       ['maxhistory']);
      addListener('listunpaidordersbyclient',             'listunpaidordersbyclient',             global.modinvoices.ListUnpaidOrdersByClient,           ['*clientid']);
      addListener('searchinvoices',                       'searchinvoices',                       global.modinvoices.ListOrders,                         ['invoiceno', 'orderno', 'pono', 'name', 'clients', 'datefrom', 'dateto', 'maxhistory']);
      addListener('listunpaidpordersbyclient',            'listunpaidpordersbyclient',            global.modinvoices.SearchInvoices,                     ['*clientid']);
      addListener('payinvoices',                          'payinvoices',                          global.modinvoices.PayInvoices,                        ['*clientid', '*refno', '*type', '*reason', '*datepaid', '*invoices']);
      addListener('paypurchaseorders',                    'paypurchaseorders',                    global.modinvoices.PayPOrders,                         ['*clientid', '*refno', '*type', '*reason', '*datepaid', '*invoices']);

      // Inventory requests
      addListener('liststock',                            'liststock',                            global.modinventory.ListStock,                         ['maxhistory']);
      addListener('addinventory',                         'addinventory',                         global.modinventory.AddInventory,                      ['*productid', 'locationid', '*qty', 'batchno', 'dateexpiry', 'dateproduction', '*type', 'comments']);
      addListener('transferinventory',                    'transferinventory',                    global.modinventory.TransferInventory,                 ['*productid', '*srclocationid', '*dstlocationid', '*qty', 'batchno']);
      addListener('getinventoryproducttotals',            'getinventoryproducttotals',            global.modinventory.ListOrders,                        ['*productid']);
      addListener('getinventoryproductlocationtotals',    'getinventoryproductlocationtotals',    global.modinventory.GetInventoryProductLocationTotals, ['*productid']);
      addListener('buildinventory',                       'buildinventory',                       global.modinventory.ListBuilds,                        ['*productid']);
      addListener('expirebuild',                          'expirebuild',                          global.modinventory.ExpireBuild,                       ['*productid']);

      // TPCC specific requests
      addListener('tpccproductcategoryfrombuildtemplate', 'tpccproductcategoryfrombuildtemplate', global.modtpcc.TPCCProductCategoryFromBuildTemplate,   ['*buildtemplateid']);
      addListener('tpccbuild',                            'tpccbuild',                            global.modtpcc.TPCCBuildInventory,                     ['*buildtemplateid', '*orderid', '*jobsheetid', '*itype', '*productid', 'numcartons', 'numcups']);
      addListener('tpccorderbuilds',                      'tpccorderbuilds',                      global.modtpcc.TPCCOrderBuilds,                        []);
      addListener('tpccprintjobsheet',                    'tpccprintjobsheet',                    global.modtpcc.TPCCPrintJobSheet,                      ['*jobsheetid']);
      addListener('tpccloadjobsheet',                     'tpccloadjobsheet',                     global.modtpcc.TPCCLoadJobSheet,                       ['*jobsheetid']);
      addListener('tpccsavejobsheet',                     'tpccsavejobsheet',                     global.modtpcc.TPCCSaveJobSheet,                       ['*jobsheetid', 'num1', 'num2', 'num3', 'num4', 'num5', 'num6', 'num7', 'num8', 'num9', 'num10', 'num11', 'num12', 'num13', 'txt1', 'txt2', 'txt3', 'txt4', 'txt5', 'txt6', 'comment', 'iswide']);
      addListener('tpccstartjobsheet',                    'tpccstartjobsheet',                    global.modtpcc.TPCCStartJobSheet,                      ['*jobsheetid']);
      addListener('tpccendjobsheet',                      'tpccendjobsheet',                      global.modtpcc.TPCCEndJobSheet,                        ['*jobsheetid']);
      addListener('tpccjobsheetsort',                     'tpccjobsheetsort',                     global.modtpcc.TPCCJobSheetSort,                       ['*jobs']);
      addListener('tpccaddjobsheetdetail',                'tpccaddjobsheetdetail',                global.modtpcc.TPCCAddJobSheetDetail,                  ['*jobsheetid', '*itype', 'num1', 'num2', 'txt1', 'txt2', 'batchno', 'machineid', 'employeeid']);
      addListener('tpcclistjobsheetdetails',              'tpcclistjobsheetdetails',              global.modtpcc.TPCCListJobSheetDetails,                ['*jobsheetid']);
      addListener('tpcccreateproductfrombuildtemplate',   'tpcccreateproductfrombuildtemplate',   global.modtpcc.TPCCCreateProductFromBuildTemplate,     ['*productcategoryid', '*clientid', '*code', '*name', '*buildtemplateid']);
      addListener('tpcclistmachines',                     'tpcclistmachines',                     global.modtpcc.TPCCListMachines,                       []);
      addListener('tpcclistcutters',                      'tpcclistcutters',                      global.modtpcc.TPCCListCutters,                        []);
      addListener('tpccsearchjobsheets',                  'tpccsearchjobsheets',                  global.modtpcc.TPCCSearchJobSheets,                    ['jobsheetno', 'orderno', 'pono', 'name', 'clients', 'shippostcode', 'shipcity', 'shipcountry', 'shipstate', 'datefrom', 'dateto', 'maxhistory']);

      // Order build requests
      addListener('listorderbuilds',                      'listorderbuilds',                      global.modinventory.ListOrderBuilds,                   ['maxhistory']);

      // Payroll requests
      addListener('listrtaps',                            'listrtaps',                            global.modpayroll.ListRTaps,                           []);
      addListener('insertrtap',                           'insertrtap',                           global.modpayroll.InsertRTap,                          ['*employeeid', '*datecreated']);

      // Gov requests
      addListener('abnlookup',                            'abnlookup',                            global.modgov.ABNLookup,                               ['*name']);

      // POS requests
      addListener('posgetproduct',                        'posgetproduct',                        global.modpos.POSGetProduct,                           ['*code']);
      addListener('posgenbarcode',                        'posgenbarcode',                        global.modpos.POSGenBarcode,                           ['*type']);
      addListener('posquote',                             'posquote',                             global.modpos.POSQuote,                                ['*products', '*total', '*cash', 'clientid', 'mobileno', 'email']);
      addListener('poscashsale',                          'poscashsale',                          global.modpos.POSCashSale,                             ['*products', '*total', '*cash', 'clientid', 'mobileno', 'email']);
      addListener('poscreditsale',                        'poscreditsale',                        global.modpos.POSCreditSale,                           ['*products', '*total', '*credit', 'clientid', 'mobileno', 'email']);
      addListener('possplitsale',                         'possplitsale',                         global.modpos.POSSplitSale,                            ['*products', '*total', '*cash', '*credit', 'clientid', 'mobileno', 'email']);
      addListener('possearchsale',                        'possearchsale',                        global.modpos.POSSearchSale,                           ['orderno', 'mobileno', 'email', 'datefrom', 'dateto']);
      addListener('posloadsale',                          'posloadsale',                          global.modpos.POSLoadSale,                             ['*orderno']);
      addListener('posnewcust',                           'posnewcust',                           global.modpos.POSNewCust,                              ['*name', 'abn', 'address1', 'address2', 'address3', 'city', 'state', 'postcode', 'contact', 'email', 'mobile']);
      addListener('possalestotal',                        'possalestotal',                        global.modpos.POSSalesTotal,                           ['*datefrom', '*dateto']);

      // Mobile device requests
      addListener('syncipad',                             'syncipad',                             global.modipad.Sync,                                   ['*lastsync']);

      // Geolocation reqeusts
      addListener('geocode',                              'geocode',                              global.modlocations.Geocode,                           ['*address']);

      // MDM requests
      addListener('lastuserpoll',                         'lastuserpoll',                         global.modmdm.LastUserPoll,                            ['*useruuid']);

      // Message requests
      addListener('emailfeedback',                        'emailfeedback',                        global.modmsg.EmailFeedback,                           ['*comments']);
      addListener('listchatsforme',                       'listchatsforme',                       global.modmsg.ListChatsForMe,                          ['maxhistory']);
      addListener('listalertsforme',                      'listalertsforme',                      global.modmsg.ListAlertsForMe,                         ['maxhistory']);
      addListener('sendmsg',                              'sendmsg',                              global.modmsg.SendMsg,                                 ['*recipients', '*msg', 'itype', 'gpslat', 'gpslon']);
      addListener('chatmsg',                              'chatmsg',                              global.modmsg.ChatMsg,                                 ['*msg', 'recipients']);
      addListener('msghistory',                           'msghistory',                           global.modmsg.MsgHistory,                              ['maxhistory']);
      addListener('emailhistory',                         'emailhistory',                         global.modmsg.EmailHistory,                            ['maxhistory']);

      // *******************************************************************************************************************************************************************************************
      // MDM events...
      spark.on
      (
        'newpoll',
        function(data)
        {
          try
          {
            global.modmdm.NewPoll(spark, 'newpoll', data.polldata);
          }

          catch (err)
          {
            global.log.info({as1: true}, '[newpoll] ' + global.text_generalexception + ' ' + err.message);
          }
        }
      );

      // *******************************************************************************************************************************************************************************************
      // Reports
      addListener
      (
        'emailhistory',
        'emailhistory',
        function(world)
        {
          // Add name of report to pdata for caller...
          world.datefrom = global.moment(world.datefrom).format('YYYY-MM-DD 00:00:00');
          world.dateto = global.moment(world.dateto).format('YYYY-MM-DD 23:59:59');
          world.pdata.report = 'report-' + world.report;

          if (world.report == 'orderslocations')
            global.modreports.OrdersLocations(world);
          else if (world.report == 'topxxorders')
            global.modreports.TopXXOrders(world);
          else if (world.report == 'topxxproductsbyqty')
            global.modreports.TopXXProductsByQty(world);
          else if (world.report == 'topxxproductsbyvalue')
            global.modreports.TopXXProductsByValue(world);
          else if (world.report == 'productsordered')
            global.modreports.ProductsOrdered(world);

          // POS reports
          else if (world.report == 'pos-salestotals')
            global.modpos.POSSalesTotal(world);

          // Customer specific reports
          else if (world.report == 'usedproductcodes')
            global.modreports.TPCCUsedProductCodes(world);
        },
        ['report', 'datefrom', 'dateto', 'clients', 'categories', 'country', 'state']
      );

      if (global.config.modules.counters)
        addListener('getcounters', 'getcounters', global.modcounters.GetCounters, []);

      // *******************************************************************************************************************************************************************************************
      // Finally all event listeners registered.... do something useful and welcome our client...
      // For MDM devices with no login, we'll also generate a unique device token to represent it...
      // TODO: Validate uniqueness of this ID across instances/existing database etc...
      var deviceid = uuidv4();
      spark.emit('welcome', {fguid: fguid, channel: global.config.env.notificationschannel, deviceid: deviceid});
    }
  );

  // *******************************************************************************************************************************************************************************************
  // "External feeds" stuff...
  if (global.config.modules.oxr)
  {
    global.oxr.set({app_id: global.config.openexchangerates.appid});
    global.oxr.latest
    (
      function()
      {
        global.fx.rates = global.oxr.rates;
        global.fx.base = global.oxr.base;
        //console.log(global.fx.convert(99, {from: 'USD', to: 'AUD'}));
        //console.log(global.fx(99).from('USD').to('AUD'));
      }
    );
  }
  else
    global.log.info({as1: true}, '[oxr] not enabled...');

  // *******************************************************************************************************************************************************************************************
  // "Background" stuff...
  if (!global.config.env.windows)
  {
    global.log.info({as1: true}, '[env] non-windows platform...');

    ekg.on
    (
      'cpu',
      function (cpu)
      {
        global.pr.sendToRoom(global.config.env.statschannel, 'stat2', {cpu: cpu});
      }
    );

    ekg.on
    (
      'memory',
      function (memory)
      {
        global.pr.sendToRoom(global.config.env.statschannel, 'stat2', {memory: memory});
      }
    );

    ekg.on
    (
      'proc',
      function (proc)
      {
        proc.uptime = os.sysUptime();
        global.pr.sendToRoom(global.config.env.statschannel, 'stat2', {proc: proc});
      }
    );
  }
  else
    global.log.info({as1: true}, '[env] windows platform...');

  global.ConsoleLog('========== Background stats process launching...');
  ekg.start(1000);

  global.ConsoleLog('========== Http(s) server starting...');
  server.listen(global.config.env.loginPort);

  // *******************************************************************************************************************************************************************************************
  // TODO: If you add/remove/modify primus plugins etc, uncomment and run the following line and copy the JS file to clients...
  // global.pr.library();
  // global.pr.save('primus-compiled.js');

  if (global.config.modules.counters)
    global.modcounters.RefreshCounters();

  global.modconfig.InitialiseCustomerConfigCache();

  //global.modauth.CreateCredentials('iwu', 'letmein');
  // global.modauth.RegisterUser({sprak: 1234, eventname: 'test-eventname', pdata: 'test-pdata', fguid: 'test-fguid', custid: 2, uid: 'iwu', name: 'Ian Wu', pwd: 'letmein', isadmin: 1});
  //global.modauth.LoginUser(1234, 'test-eventname', 'test-fguid', 'iwu', 'letmein', 'test-pdata');
  //global.modauth.LogoutUser(1234, 'test-eventname', 'test-fguid', 'iwu', 'test-pdata');
  //global.modauth.GetUser({spark: 1234, eventname: 'test-eventname', pdata: 'test-pdata', fguid: 'test-fguid', uid: 'iwu'});

  //global.modimport.ImportMyobProducts({filename: 'items.xlsx', cn: {custid: 2, userid: 13}});
  //global.modimport.ImportMyobClients({filename: 'customers.xlsx', cn: {custid: 2, userid: 13}});
  //global.modimport.ImportProducts1({filename: 'product_list.xlsx', cn: {custid: 2, userid: 13}, uuid: '05fcb11de8634dba01690ac7bb55a141'});
  //global.modimport.ImportProducts2({filename: 'product_barcodes.xlsx', cn: {custid: 2, userid: 13}, uuid: '05fcb11de8634dba01690ac7bb55a141'});
  //global.modimport.ImportInventory1({filename: 'invctst2.xlsx', cn: {custid: 2, userid: 13}, uuid: '05fcb11de8634dba01690ac7bb55a141'});

  /*
  var hours =
  [
    // Starts from monday...
    {start: '07:00', finish: '16:00'},
    {start: '07:00', finish: '16:00'},
    {start: '07:00', finish: '16:00'},
    {start: '07:00', finish: '16:00'},
    {start: '07:00', finish: '16:00'},
    {},
    {},
  ];
  global.safejsonstringify
  (
    hours,
    function(err, json)
    {
      console.log(hours);
      console.log(json);
    }
  );
  */
  //global.modprinting.CalcPayrollFromRtap('2017-03-15', 7);

  //global.modimport.ImportMyobEmployees({filename: 'uploads/imports/aemployees.xlsx', cn: {custid: 2, userid: 13}});

  //global.modprinting.EmailRfidTaps();

  //global.modscripts.Try1();
  //global.modscripts.Try2();
  //global.modscripts.Try3();
  //global.modscripts.Try4();
  //global.modscripts.Try5();
  //global.modscripts.Try6();
  //global.modscripts.Try7();
  //global.modscripts.Try8();
  //global.modscripts.Try9();
  //global.modscripts.Try10();
  //global.modscripts.Try11();
  //global.modscripts.Try12();
  //global.modscripts.Try13();
  //global.modscripts.Try14();
  //global.modscripts.Try15();
  //global.modscripts.Try16();

  /*
  global.modinventory.AddInventory
  (
    {
      cn: {custid: 2, userid: 13},
      productid: 20222,
      locationid: 11,
      qty: -10,
      batchno: '',
      dateexpiry: null,
      dateproduction: null,
      otherid: null,
      comments: '',
      type: 4
    }
  );
  */
}
