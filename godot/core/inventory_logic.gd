class_name InventoryLogic
extends RefCounted


static func count_item(inv: Dictionary, id: StringName) -> int:
	var k: String = String(id)
	return maxi(0, int(inv.get(k, 0)))


static func add_item(inv: Dictionary, id: StringName, qty: int = 1) -> void:
	if qty <= 0 or String(id).is_empty():
		return
	var k: String = String(id)
	inv[k] = maxi(0, int(inv.get(k, 0))) + qty


static func remove_item(inv: Dictionary, id: StringName, qty: int = 1) -> bool:
	if qty <= 0:
		return false
	var k: String = String(id)
	var cur: int = int(inv.get(k, 0))
	if cur < qty:
		return false
	var rem: int = cur - qty
	if rem <= 0:
		inv.erase(k)
	else:
		inv[k] = rem
	return true


static func buy_item(gold: int, inv: Dictionary, price: int, id: StringName, qty: int = 1) -> Dictionary:
	var total_cost: int = maxi(0, price) * maxi(1, qty)
	if qty <= 0 or price < 0 or gold < total_cost:
		return {"ok": false, "gold": gold}
	add_item(inv, id, qty)
	return {"ok": true, "gold": gold - total_cost}


static func sell_item(gold: int, inv: Dictionary, sell_price: int, id: StringName, qty: int = 1) -> Dictionary:
	if qty <= 0 or sell_price < 0:
		return {"ok": false, "gold": gold}
	if not remove_item(inv, id, qty):
		return {"ok": false, "gold": gold}
	return {"ok": true, "gold": gold + sell_price * qty}
