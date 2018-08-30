function doWidgetListeners()
{
  doDashTabWidgets();

  // Immediately load TABs that we need to interact with, delay the rest...
  doQuotesTabWidgets();
  doOrdersTabWidgets();
  doInvoicesTabWidgets();
  doClientsTabWidgets();

  doPOrdersTabWidgets();
  doSuppliersTabWidgets();

  doProductsTabWidgets();
  doProductCategoriesTabWidgets();
  doLocationsTabWidgets();
  doBuildTemplatesTabWidgets();
  doInvStockTabWidgets();
  doJobSheetsTabWidgets();
  doBuildsTabWidgets();

  doExchangeRatesTabWidgets();

  doEmployeesTabWidgets();
  doSuperfundsTabWidgets();
  doTimeclockTabWidgets();
  doPortfolioTabWidgets();

  doAccountsTabWidgets();
  doTaxCodesTabWidgets();
  doJournalsTabWidgets();

  doUsersTabWidgets();
  doStatusAlertsTabWidgets();
  doProductTemplatesTabWidgets();
  doTemplatesTabWidgets();
  doEmailsTabWidgets();
  doMaintenanceTabWidgets();

  $('#salestabs').tabs
  (
    {
      onSelect: function(title, index)
      {
        switch (title)
        {
          case 'Orders':
            // TODO: check permissions - may not need to refresh at all
            // Force refresh when coming back to this TAB without tapping refresh button...
            doContextMenu('orderspopup', 'refresh');
            break;
          case 'Clients':
            // TODO: check permissions - may not need to refresh at all
            // Force refresh when coming back to this TAB without tapping refresh button...
            doContextMenu('clientspopup', 'refresh');
            break;
        }
      }
    }
  );
}
