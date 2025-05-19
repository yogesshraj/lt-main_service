package com.celllocationtracker;

import android.Manifest;
import android.content.pm.PackageManager;
import android.telephony.CellInfo;
import android.telephony.CellInfoLte;
import android.telephony.TelephonyManager;
import android.telephony.CellIdentityLte;
import android.telephony.CellSignalStrengthLte;

import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import java.util.List;

public class CellInfoModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private TelephonyManager telephonyManager;

    public CellInfoModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.telephonyManager = (TelephonyManager) reactContext.getSystemService(reactContext.TELEPHONY_SERVICE);
    }

    @Override
    public String getName() {
        return "CellInfoModule";
    }

    @ReactMethod
    public void getCellTowerInfo(Callback errorCallback, Callback successCallback) {
        try {
            if (ActivityCompat.checkSelfPermission(reactContext, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED ||
                ActivityCompat.checkSelfPermission(reactContext, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED ||
                ActivityCompat.checkSelfPermission(reactContext, Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
                errorCallback.invoke("Required permissions not granted");
                return;
            }

            List<CellInfo> cellInfoList = telephonyManager.getAllCellInfo();
            if (cellInfoList != null && !cellInfoList.isEmpty()) {
                for (CellInfo cellInfo : cellInfoList) {
                    if (cellInfo instanceof CellInfoLte && cellInfo.isRegistered()) {
                        CellInfoLte cellInfoLte = (CellInfoLte) cellInfo;
                        CellIdentityLte cellIdentity = cellInfoLte.getCellIdentity();
                        CellSignalStrengthLte cellSignal = cellInfoLte.getCellSignalStrength();

                        WritableMap cellData = new WritableNativeMap();
                        cellData.putInt("cellId", cellIdentity.getCi());
                        cellData.putInt("lac", cellIdentity.getTac());
                        cellData.putInt("mcc", cellIdentity.getMcc());
                        cellData.putInt("mnc", cellIdentity.getMnc());
                        cellData.putInt("signalStrength", cellSignal.getDbm());

                        successCallback.invoke(cellData);
                        return;
                    }
                }
            }
            errorCallback.invoke("No cell information available");
        } catch (Exception e) {
            errorCallback.invoke(e.getMessage());
        }
    }
} 