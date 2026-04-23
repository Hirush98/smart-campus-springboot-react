package com.smartcampus.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.smartcampus.service.QRCodeService;

@RestController
@RequestMapping("/api/resources")
public class QRCodeController {

    private final QRCodeService qrCodeService;

    public QRCodeController(QRCodeService qrCodeService) {
        this.qrCodeService = qrCodeService;
    }

    @GetMapping("/{id}/qr")
    public ResponseEntity<byte[]> getQRCode(@PathVariable String id) {

        String url = "http://localhost:3000/resources/" + id;

        byte[] qrImage = qrCodeService.generateQRCode(url);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=qr.png")
                .contentType(MediaType.IMAGE_PNG)
                .body(qrImage);
    }
}