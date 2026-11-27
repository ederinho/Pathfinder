package com.ederinho.pathfinder;

import android.content.pm.ApplicationInfo;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.AtomicFile;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileNotFoundException;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.util.Arrays;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

@CapacitorPlugin(name = "PathfinderDevToken")
public class DevTokenPlugin extends Plugin {
    private static final String ALIAS = "pathfinder-dev-token-v1";
    private boolean allowed(PluginCall call) {
        if ((getContext().getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) return true;
        call.reject("Development builds only"); return false;
    }
    private AtomicFile file() { return new AtomicFile(new File(getContext().getNoBackupFilesDir(), "pathfinder-dev-token-v1.bin")); }
    private KeyStore store() throws Exception { KeyStore ks=KeyStore.getInstance("AndroidKeyStore"); ks.load(null); return ks; }
    private SecretKey key(boolean create) throws Exception {
        KeyStore ks=store();
        if (ks.containsAlias(ALIAS)) return (SecretKey)ks.getKey(ALIAS,null);
        if (!create) throw new IllegalStateException();
        KeyGenerator gen=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");
        gen.init(new KeyGenParameterSpec.Builder(ALIAS,KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT)
          .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).setKeySize(256).build());
        return gen.generateKey();
    }
    @PluginMethod public synchronized void readToken(PluginCall call) {
        if(!allowed(call))return;
        try {
            byte[] b; try {b=file().readFully();} catch(FileNotFoundException e){call.resolve(new JSObject().put("token",""));return;}
            if(b.length!=92) throw new IllegalStateException();
            Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE,key(false),new GCMParameterSpec(128,Arrays.copyOfRange(b,0,12)));
            String t=new String(cipher.doFinal(Arrays.copyOfRange(b,12,b.length)),StandardCharsets.US_ASCII);
            if(!t.matches("[a-fA-F0-9]{64}"))throw new IllegalStateException();
            call.resolve(new JSObject().put("token",t));
        } catch(Exception e){call.reject("Token unavailable; forget and enter again");}
    }
    @PluginMethod public synchronized void saveToken(PluginCall call) {
        if(!allowed(call))return;
        String t=call.getString("token");
        if(t==null||!t.matches("[a-fA-F0-9]{64}")){call.reject("Invalid token");return;}
        AtomicFile f=file(); FileOutputStream out=null;
        try {
            Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.ENCRYPT_MODE,key(true));
            byte[] iv=cipher.getIV(), encrypted=cipher.doFinal(t.getBytes(StandardCharsets.US_ASCII));
            if(iv.length!=12||encrypted.length!=80)throw new IllegalStateException();
            out=f.startWrite();out.write(iv);out.write(encrypted);f.finishWrite(out);out=null;call.resolve();
        } catch(Exception e){if(out!=null)f.failWrite(out);call.reject("Could not save token");}
    }
    @PluginMethod public synchronized void forgetToken(PluginCall call) {
        if(!allowed(call))return;
        try{store().deleteEntry(ALIAS);file().delete();call.resolve();}catch(Exception e){call.reject("Could not remove token");}
    }
}
