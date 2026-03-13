# Testing Checklist - Fix PGRST201 & Schema Integrity

Use this checklist to verify that the duplicate foreign key error (PGRST201) and column ambiguity issues are resolved.

### Database Integrity
1. [ ] **Verify Schema Fix**: Check if `user_id` and `car_id` columns are removed from `reservas`.
2. [ ] **Verify FKs**: Ensure only `reservas_usuario_id_fkey` and `reservas_carro_id_fkey` exist.
3. [ ] **Verify Data Migration**: Confirm existing reservations are visible and linked to correct users.

### User Flow - Standard User
4. [ ] **Login**: Login successfully as a regular user.
5. [ ] **Create Reservation**: Complete the "Reservar Agora" flow.
   - [ ] Check console for `[RESERVA] Criando reserva. Usando colunas corretas: usuario_id, carro_id`.
   - [ ] Verify success toast and redirection.
6. [ ] **Document Upload**: Upload a document on the confirmation/documents page.
   - [ ] Check console for `[Documentos] Using correct column names: usuario_id and carro_id`.
7. [ ] **My Reservations**: Go to "Minhas Reservas".
   - [ ] Check console for `[MinhasReservas] Using getUserReservas with explicit FK syntax`.
   - [ ] Verify list loads without errors.
8. [ ] **Reservation Details**: Click on a reservation.
   - [ ] Check console for `[DetalhesReserva] Using getReservaById with explicit FK syntax`.
   - [ ] Verify car and date details are correct.
9. [ ] **Confirmation Page**: Visit confirmation page of a new reservation.
   - [ ] Check console for `[ReservationConfirmation] Using getReservaById with explicit FK syntax`.

### Admin Flow
10. [ ] **Admin Login**: Login as admin.
11. [ ] **Admin Dashboard**: Check if stats load correctly.
   - [ ] Check console for `[DB] getDashboardStats - Fetching stats with explicit FK syntax`.
12. [ ] **Admin Reservations List**: Go to `/admin/reservas`.
   - [ ] Check console for `[AdminReservations] Fetching reservas with explicit FK syntax`.
   - [ ] Verify table columns (Client Name, Car Name) are populated (no empty fields).
13. [ ] **Admin Reservation Details**: Click "Ver Detalhes".
   - [ ] Check console for `[AdminDetalhesReserva] Using getReservaById with explicit FK syntax`.
   - [ ] Verify "Dados do Cliente" and "Veículo" sections are populated.
14. [ ] **Status Update**: Change reservation status (e.g., to Confirmada).
   - [ ] Verify status updates in UI and database.

### Error Monitoring
15. [ ] **Monitor for PGRST201**: Ensure no "Could not embed... ambiguous" errors in console.
16. [ ] **Monitor for PGRST116**: Ensure no "JSON object requested, multiple (or no) rows returned" errors (especially in createReserva).
17. [ ] **Monitor for 42703**: Ensure no "column does not exist" errors for `user_id` or `car_id`.

### Specific Edge Cases
18. [ ] **Empty List**: Verify "Minhas Reservas" handles empty state gracefully.
19. [ ] **Cancelled Reservation**: Verify details page for cancelled reservation works.
20. [ ] **Null Car**: (If possible) Verify admin list handles deleted cars gracefully (should show "Veículo removido" or similar).

### Service Function Verification (Console Logs)
21. [ ] `createReserva`: Log confirmed correct payload.
22. [ ] `getReservaById`: Log confirmed explicit FK syntax usage.