"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Copy, 
  CheckCircle, 
  Phone, 
  User, 
  CreditCard,
  Smartphone,
  AlertCircle
} from "lucide-react";
import { useGlobalToast } from "@/hooks/useGlobalToast";

interface PaymentMethod {
  wave?: {
    number: string;
    name: string;
  };
  mynita?: {
    number: string;
    name: string;
  };
  orange_money?: {
    number: string;
    name: string;
  };
}

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  paymentMethods: PaymentMethod;
  orderTotal: number;
  orderId: string;
  onPaymentConfirmed: (transactionRef: string, method: string) => void;
}

export function ManualPaymentModal({
  isOpen,
  onClose,
  restaurantName,
  paymentMethods,
  orderTotal,
  orderId,
  onPaymentConfirmed
}: ManualPaymentModalProps) {
  const { showSuccess, showError } = useGlobalToast();
  const [selectedMethod, setSelectedMethod] = useState<'wave' | 'mynita' | 'orange_money' | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copié !', 'Numéro copié dans le presse-papiers');
  };

  const handleConfirmPayment = async () => {
    if (!selectedMethod || !transactionRef.trim()) {
      showError('Erreur', 'Veuillez sélectionner un mode de paiement et saisir la référence');
      return;
    }

    setIsConfirming(true);
    try {
      // Simuler l'envoi de confirmation
      await new Promise(resolve => setTimeout(resolve, 1500));
      onPaymentConfirmed(transactionRef, selectedMethod);
      showSuccess('Paiement confirmé !', 'Votre commande sera traitée sous peu');
      onClose();
    } catch (error) {
      showError('Erreur', 'Impossible de confirmer le paiement');
    } finally {
      setIsConfirming(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'wave': return <Smartphone className="h-5 w-5 text-blue-600" />;
      case 'mynita': return <CreditCard className="h-5 w-5 text-green-600" />;
      case 'orange_money': return <Phone className="h-5 w-5 text-orange-600" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'wave': return 'from-blue-500 to-blue-600';
      case 'mynita': return 'from-green-500 to-green-600';
      case 'orange_money': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const availableMethods = Object.entries(paymentMethods).filter(([_, info]) => info);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            Paiement Mobile
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Effectuez votre paiement via mobile money puis confirmez la transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Résumé commande */}
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{restaurantName}</p>
                  <p className="text-sm text-gray-600">Commande #{orderId.slice(-8)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-green-600">
                    {orderTotal.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sélection méthode de paiement */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Choisissez votre mode de paiement :</h3>
            
            {availableMethods.map(([method, info]) => (
              <Card 
                key={method}
                className={`cursor-pointer transition-all duration-300 ${
                  selectedMethod === method 
                    ? 'ring-2 ring-green-500 bg-green-50 border-green-200' 
                    : 'hover:shadow-md border-gray-200'
                }`}
                onClick={() => setSelectedMethod(method as any)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${getMethodColor(method)} rounded-2xl flex items-center justify-center`}>
                        {getMethodIcon(method)}
                      </div>
                      <div>
                        <p className="font-semibold capitalize text-gray-800">
                          {method.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {info.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-bold text-gray-800">
                        {info.number}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(info.number);
                        }}
                        className="mt-1"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Instructions de paiement */}
          {selectedMethod && (
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-800">Instructions :</h4>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Ouvrez votre app {selectedMethod.replace('_', ' ')}</li>
                      <li>Envoyez <strong>{orderTotal.toLocaleString('fr-FR')} FCFA</strong> au numéro ci-dessus</li>
                      <li>Notez la référence de transaction</li>
                      <li>Saisissez cette référence ci-dessous pour confirmer</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirmation de transaction */}
          {selectedMethod && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Référence de transaction *
              </label>
              <Input
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="Ex: TXN123456789 ou MP240916..."
                className="text-lg py-3 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500">
                Cette référence apparaît dans votre SMS de confirmation ou dans l'historique de votre app
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 py-3 rounded-xl"
              disabled={isConfirming}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmPayment}
              disabled={!selectedMethod || !transactionRef.trim() || isConfirming}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {isConfirming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirmation...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmer le paiement
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
