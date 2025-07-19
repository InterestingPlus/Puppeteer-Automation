(function () {
  window.TranTaxReceipt = () => {
    console.log("✅ TranTaxReceipt override injected via external script.");

    if (
      document.getElementById("ctl00_ContentPlaceHolder1_TxtMilkatno").value !=
        "" &&
      document.getElementById("ctl00_ContentPlaceHolder1_DDLCashBank").value !=
        ""
    ) {
      //if (DXMilkatNo.GetValue != null) {
      var ID = GetParameterValues("ID");
      var E = GetParameterValues("E");
      var D = GetParameterValues("D");
      var Query = "";
      var NID = "";

      function GetParameterValues(param) {
        var url = window.location.href
          .slice(window.location.href.indexOf("?") + 1)
          .split("&");
        for (var i = 0; i < url.length; i++) {
          var urlparam = url[i].split("=");
          if (urlparam[0] == param) {
            return urlparam[1];
          }
        }
      }

      var tblrows = document.getElementById("tblGridValue").rows.length;
      var TxtMalelPreTotal = 0;
      var TxtMalelCurrTotal = 0;
      var TxtMalelTotalTotal = 0;

      var child = "";

      for (var CurrRow = 0; CurrRow < tblrows - 2; CurrRow++) {
        if (document.getElementById("TxtMalelPre" + CurrRow).value == "") {
          document.getElementById("TxtMalelPre" + CurrRow).value = "0";
        }
        if (document.getElementById("TxtMalelCurr" + CurrRow).value == "") {
          document.getElementById("TxtMalelCurr" + CurrRow).value = "0";
        }
        //alert(document.getElementById("TxtMalelCurr" + CurrRow).value);
        //alert(document.getElementById("TxtMalelPre" + CurrRow).value);
        child =
          child +
          document.getElementById("Lbl" + CurrRow).innerHTML +
          "¶" +
          document.getElementById("TxtMalelPre" + CurrRow).value +
          "¶" +
          document.getElementById("TxtMalelCurr" + CurrRow).value +
          "¶" +
          parseFloat(
            document.getElementById("TxtMalelTotal" + CurrRow).innerHTML
          ) +
          "¶";

        TxtMalelTotalTotal =
          parseFloat(TxtMalelTotalTotal) +
          parseFloat(
            document.getElementById("TxtMalelTotal" + CurrRow).innerHTML
          );
      }
      var nTxtPreAmt1 = document.getElementById("TxtMalelPre0").value;
      var nTxtPreAmt2 = document.getElementById("TxtMalelPre1").value;
      var nTxtPreAmt3 = document.getElementById("TxtMalelPre2").value;
      var nTxtPreAmt4 = document.getElementById("TxtMalelPre3").value;
      var nTxtPreAmt5 = document.getElementById("TxtMalelPre4").value;
      var nTxtPreAmt6 = document.getElementById("TxtMalelPre5").value;
      var nTxtPreAmt7 = document.getElementById("TxtMalelPre6").value;
      var nTxtPreAmt8 = document.getElementById("TxtMalelPre7").value;
      var nTxtPreAmt9 = document.getElementById("TxtMalelPre8").value;
      var nTxtPreAmt10 = document.getElementById("TxtMalelPre9").value;
      var nTxtPreAmt11 = document.getElementById("TxtMalelPre10").value;
      var nTxtPreAmt12 = document.getElementById("TxtMalelPre11").value;
      var nTxtPreAmt13 = document.getElementById("TxtMalelPre12").value;

      var nTxtCurrAmt1 = document.getElementById("TxtMalelCurr0").value;
      var nTxtCurrAmt2 = document.getElementById("TxtMalelCurr1").value;
      var nTxtCurrAmt3 = document.getElementById("TxtMalelCurr2").value;
      var nTxtCurrAmt4 = document.getElementById("TxtMalelCurr3").value;
      var nTxtCurrAmt5 = document.getElementById("TxtMalelCurr4").value;
      var nTxtCurrAmt6 = document.getElementById("TxtMalelCurr5").value;
      var nTxtCurrAmt7 = document.getElementById("TxtMalelCurr6").value;
      var nTxtCurrAmt8 = document.getElementById("TxtMalelCurr7").value;
      var nTxtCurrAmt9 = document.getElementById("TxtMalelCurr8").value;
      var nTxtCurrAmt10 = document.getElementById("TxtMalelCurr9").value;
      var nTxtCurrAmt11 = document.getElementById("TxtMalelCurr10").value;
      var nTxtCurrAmt12 = document.getElementById("TxtMalelCurr11").value;
      var nTxtCurrAmt13 = document.getElementById("TxtMalelCurr12").value;

      if (ID == undefined) {
        document.getElementById(
          "ctl00_ContentPlaceHolder1_BtnSave"
        ).disabled = true;
        Query = "I";
        $.ajax({
          url: "TranTaxReceiptPV.asmx/TranTaxReceiptPVAddUpdateDelete",
          data:
            "{ 'Query':'" +
            Query +
            "','NID':'" +
            NID +
            "','nparentid':'" +
            document.getElementById("ctl00_ContentPlaceHolder1_TxtMilkatno")
              .value +
            "','npaidrsPer':'" +
            TxtMalelTotalTotal +
            "','ddate':'" +
            document.getElementById("ctl00_ContentPlaceHolder1_TxtRecDate")
              .value +
            "','ccashchq':'" +
            document.getElementById("ctl00_ContentPlaceHolder1_DDLCashBank")
              .value +
            "','nchqno':'" +
            document.getElementById("ctl00_ContentPlaceHolder1_TxtChequeNo")
              .value +
            "','npahocno':'" +
            document.getElementById("ctl00_ContentPlaceHolder1_TxtRecno")
              .value +
            "','dchdate':'" +
            document.getElementById("ctl00_ContentPlaceHolder1_TxtChequeDate")
              .value +
            "','cbankname':'" +
            document.getElementById("ctl00_ContentPlaceHolder1_TxtBank").value +
            "','cbankbranch':'" +
            document.getElementById("ctl00_ContentPlaceHolder1_TxtBranch")
              .value +
            "','nAccID':'" +
            document.getElementById("ctl00_ContentPlaceHolder1_DDLCashBank")
              .value +
            "','Child':'" +
            child +
            "','Mobile':'" +
            document.getElementById("ctl00_ContentPlaceHolder1_TxtMobile")
              .value +
            "','nTxtCurrAmt1':'" +
            nTxtCurrAmt1 +
            "','nTxtCurrAmt2':'" +
            nTxtCurrAmt2 +
            "','nTxtCurrAmt3':'" +
            nTxtCurrAmt3 +
            "','nTxtCurrAmt4':'" +
            nTxtCurrAmt4 +
            "','nTxtCurrAmt5':'" +
            nTxtCurrAmt5 +
            "','nTxtCurrAmt6':'" +
            nTxtCurrAmt6 +
            "','nTxtCurrAmt7':'" +
            nTxtCurrAmt7 +
            "','nTxtCurrAmt8':'" +
            nTxtCurrAmt8 +
            "','nTxtCurrAmt9':'" +
            nTxtCurrAmt9 +
            "','nTxtCurrAmt10':'" +
            nTxtCurrAmt10 +
            "','nTxtCurrAmt11':'" +
            nTxtCurrAmt11 +
            "','nTxtCurrAmt12':'" +
            nTxtCurrAmt12 +
            "','nTxtCurrAmt13':'" +
            nTxtCurrAmt13 +
            "','nTxtPreAmt1':'" +
            nTxtPreAmt1 +
            "','nTxtPreAmt2':'" +
            nTxtPreAmt2 +
            "','nTxtPreAmt3':'" +
            nTxtPreAmt3 +
            "','nTxtPreAmt4':'" +
            nTxtPreAmt4 +
            "','nTxtPreAmt5':'" +
            nTxtPreAmt5 +
            "','nTxtPreAmt6':'" +
            nTxtPreAmt6 +
            "','nTxtPreAmt7':'" +
            nTxtPreAmt7 +
            "','nTxtPreAmt8':'" +
            nTxtPreAmt8 +
            "','nTxtPreAmt9':'" +
            nTxtPreAmt9 +
            "','nTxtPreAmt10':'" +
            nTxtPreAmt10 +
            "','nTxtPreAmt11':'" +
            nTxtPreAmt11 +
            "','nTxtPreAmt12':'" +
            nTxtPreAmt12 +
            "','nTxtPreAmt13':'" +
            nTxtPreAmt13 +
            "'}",
          //data: "{ 'Query':'" + Query + "','NID':'" + NID + "','nparentid':'" + $('#ctl00_ContentPlaceHolder1_HFMilkatNo').val() + "','npaidrsPer':'" + TxtMalelTotalTotal + "','ddate':'" + document.getElementById("ctl00_ContentPlaceHolder1_TxtRecDate").value + "','ccashchq':'" + document.getElementById("ctl00_ContentPlaceHolder1_DDLCashBank").value + "','nchqno':'" + document.getElementById("ctl00_ContentPlaceHolder1_TxtChequeNo").value + "','npahocno':'" + document.getElementById("ctl00_ContentPlaceHolder1_TxtRecno").value + "','dchdate':'" + document.getElementById("ctl00_ContentPlaceHolder1_TxtChequeDate").value + "','cbankname':'" + document.getElementById("ctl00_ContentPlaceHolder1_TxtBank").value + "','cbankbranch':'" + document.getElementById("ctl00_ContentPlaceHolder1_TxtBranch").value + "','nAccID':'" + document.getElementById("ctl00_ContentPlaceHolder1_DDLCashBank").value + "','Child':'" + child + "','Mobile':'"+document.getElementById("ctl00_ContentPlaceHolder1_TxtMobile").value  +"' }",
          dataType: "json",
          type: "POST",
          contentType: "application/json; charset=utf-8",
          success: function (data) {
            document.getElementById(
              "ctl00_ContentPlaceHolder1_BtnSave"
            ).disabled = false;
            if (data.d.cType == false) {
              alert(data.d.Msg);
              return;
            } else {
              const milkatId = document.getElementById(
                "ctl00_ContentPlaceHolder1_TxtMilkatno"
              ).value;
              const receiptId = data.d.nPahocNo;

              (async () => {
                try {
                  await fetch(
                    "https://a-f-infosys-smart-management.onrender.com/update-receipt",
                    // "http://localhost:4000/update-receipt",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        milkatId,
                        receiptNumber: receiptId,
                      }),
                    }
                  );

                  alert("✅ Receipt number updated in Record");

                  window.location.href = `https://afinfosys.netlify.app/reciept_format?m_id=${milkatId}`;
                } catch (err) {
                  console.error(
                    "❌ Failed to update receipt number in sheet:",
                    err
                  );
                  alert("❌ Failed to update receipt number in sheet:", err);
                }
              })();

              alert(data.d.Msg + " અને  પહોચ નંબર " + data.d.nPahocNo + " છે!");
              printMe(data.d.NID);
            }
            //alert(data.d.Msg);
            //location.href = "TranTaxReceiptPV.aspx";
          },
        });
      } else {
        NID = ID;
        if (E == "kEUY7+XbbAk") {
          document.getElementById(
            "ctl00_ContentPlaceHolder1_BtnSave"
          ).disabled = true;
          Query = "U";

          $.ajax({
            url: "TranTaxReceiptPV.asmx/TranTaxReceiptPVAddUpdateDelete",
            data:
              "{ 'Query':'" +
              Query +
              "','NID':'" +
              NID +
              "','nparentid':'" +
              document.getElementById("ctl00_ContentPlaceHolder1_TxtMilkatno")
                .value +
              "','npaidrsPer':'" +
              TxtMalelTotalTotal +
              "','ddate':'" +
              document.getElementById("ctl00_ContentPlaceHolder1_TxtRecDate")
                .value +
              "','ccashchq':'" +
              document.getElementById("ctl00_ContentPlaceHolder1_DDLCashBank")
                .value +
              "','nchqno':'" +
              document.getElementById("ctl00_ContentPlaceHolder1_TxtChequeNo")
                .value +
              "','npahocno':'" +
              document.getElementById("ctl00_ContentPlaceHolder1_TxtRecno")
                .value +
              "','dchdate':'" +
              document.getElementById("ctl00_ContentPlaceHolder1_TxtChequeDate")
                .value +
              "','cbankname':'" +
              document.getElementById("ctl00_ContentPlaceHolder1_TxtBank")
                .value +
              "','cbankbranch':'" +
              document.getElementById("ctl00_ContentPlaceHolder1_TxtBranch")
                .value +
              "','nAccID':'" +
              document.getElementById("ctl00_ContentPlaceHolder1_DDLCashBank")
                .value +
              "','Child':'" +
              child +
              "','Mobile':'" +
              document.getElementById("ctl00_ContentPlaceHolder1_TxtMobile")
                .value +
              "','nTxtCurrAmt1':'" +
              nTxtCurrAmt1 +
              "','nTxtCurrAmt2':'" +
              nTxtCurrAmt2 +
              "','nTxtCurrAmt3':'" +
              nTxtCurrAmt3 +
              "','nTxtCurrAmt4':'" +
              nTxtCurrAmt4 +
              "','nTxtCurrAmt5':'" +
              nTxtCurrAmt5 +
              "','nTxtCurrAmt6':'" +
              nTxtCurrAmt6 +
              "','nTxtCurrAmt7':'" +
              nTxtCurrAmt7 +
              "','nTxtCurrAmt8':'" +
              nTxtCurrAmt8 +
              "','nTxtCurrAmt9':'" +
              nTxtCurrAmt9 +
              "','nTxtCurrAmt10':'" +
              nTxtCurrAmt10 +
              "','nTxtCurrAmt11':'" +
              nTxtCurrAmt11 +
              "','nTxtCurrAmt12':'" +
              nTxtCurrAmt12 +
              "','nTxtCurrAmt13':'" +
              nTxtCurrAmt13 +
              "','nTxtPreAmt1':'" +
              nTxtPreAmt1 +
              "','nTxtPreAmt2':'" +
              nTxtPreAmt2 +
              "','nTxtPreAmt3':'" +
              nTxtPreAmt3 +
              "','nTxtPreAmt4':'" +
              nTxtPreAmt4 +
              "','nTxtPreAmt5':'" +
              nTxtPreAmt5 +
              "','nTxtPreAmt6':'" +
              nTxtPreAmt6 +
              "','nTxtPreAmt7':'" +
              nTxtPreAmt7 +
              "','nTxtPreAmt8':'" +
              nTxtPreAmt8 +
              "','nTxtPreAmt9':'" +
              nTxtPreAmt9 +
              "','nTxtPreAmt10':'" +
              nTxtPreAmt10 +
              "','nTxtPreAmt11':'" +
              nTxtPreAmt11 +
              "','nTxtPreAmt12':'" +
              nTxtPreAmt12 +
              "','nTxtPreAmt13':'" +
              nTxtPreAmt13 +
              "'}",
            //data: "{ 'Query':'" + Query + "','NID':'" + NID + "','nparentid':'" + $('#ctl00_ContentPlaceHolder1_HFMilkatNo').val() + "','npaidrsPer':'" + TxtMalelTotalTotal + "','ddate':'" + document.getElementById("ctl00_ContentPlaceHolder1_TxtRecDate").value + "','ccashchq':'" + document.getElementById("ctl00_ContentPlaceHolder1_DDLCashBank").value + "','nchqno':'" + document.getElementById("ctl00_ContentPlaceHolder1_TxtChequeNo").value + "','npahocno':'" + document.getElementById("ctl00_ContentPlaceHolder1_TxtRecno").value + "','dchdate':'" + document.getElementById("ctl00_ContentPlaceHolder1_TxtChequeDate").value + "','cbankname':'" + document.getElementById("ctl00_ContentPlaceHolder1_TxtBank").value + "','cbankbranch':'" + document.getElementById("ctl00_ContentPlaceHolder1_TxtBranch").value + "','nAccID':'" + document.getElementById("ctl00_ContentPlaceHolder1_DDLCashBank").value + "','Child':'" + child + "','Mobile':'"+document.getElementById("ctl00_ContentPlaceHolder1_TxtMobile").value  +"' }",
            dataType: "json",
            type: "POST",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
              document.getElementById(
                "ctl00_ContentPlaceHolder1_BtnSave"
              ).disabled = false;
              alert(data.d.Msg);
              if (data.d.cType == false) {
                return;
              } else {
                printMe(data.d.NID);
              }
              //location.href = "ListTranTaxReceiptPV.aspx";
            },
          });
        } else if (D == "kEUY7+XbbAk") {
          notify("Delete?", "તમે આ માહિતી રદ કરવા માગો છો?");
          Query = "D";
        }
      }
    } else {
      if (
        document.getElementById("ctl00_ContentPlaceHolder1_DDLCashBank")
          .value == ""
      ) {
        alert("રોકડ / બેંક જરૂરી છે.");
      } else {
        alert("મિલકત નં. જરૂરી છે.");
      }
    }
  };
})();
